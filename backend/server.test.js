const request = require("supertest");
const express = require("express");
const cors = require("cors");

// Inline mini-app for testing
const app = express();
app.use(cors());
app.use(express.json());

let history = [];

app.get("/health", (req, res) => res.json({ status: "healthy" }));

app.post("/api/calculate", (req, res) => {
  const { a, b, operator } = req.body;
  if (a === undefined || b === undefined || !operator)
    return res.status(400).json({ error: "Paramètres manquants" });
  const numA = parseFloat(a), numB = parseFloat(b);
  if (isNaN(numA) || isNaN(numB))
    return res.status(400).json({ error: "Nombres invalides" });
  let result;
  switch (operator) {
    case "+": result = numA + numB; break;
    case "-": result = numA - numB; break;
    case "*": result = numA * numB; break;
    case "/":
      if (numB === 0) return res.status(400).json({ error: "Division par zéro" });
      result = numA / numB; break;
    default: return res.status(400).json({ error: "Opérateur inconnu" });
  }
  const entry = { id: Date.now(), result, timestamp: new Date().toISOString() };
  history.unshift(entry);
  res.json(entry);
});

app.get("/api/history", (req, res) => res.json(history));

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("Calculator API", () => {
  test("GET /health → 200", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("healthy");
  });

  test("POST /api/calculate addition", async () => {
    const res = await request(app)
      .post("/api/calculate")
      .send({ a: 10, b: 5, operator: "+" });
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(15);
  });

  test("POST /api/calculate soustraction", async () => {
    const res = await request(app)
      .post("/api/calculate")
      .send({ a: 10, b: 3, operator: "-" });
    expect(res.body.result).toBe(7);
  });

  test("POST /api/calculate multiplication", async () => {
    const res = await request(app)
      .post("/api/calculate")
      .send({ a: 4, b: 5, operator: "*" });
    expect(res.body.result).toBe(20);
  });

  test("POST /api/calculate division", async () => {
    const res = await request(app)
      .post("/api/calculate")
      .send({ a: 10, b: 2, operator: "/" });
    expect(res.body.result).toBe(5);
  });

  test("POST /api/calculate division par zéro → 400", async () => {
    const res = await request(app)
      .post("/api/calculate")
      .send({ a: 5, b: 0, operator: "/" });
    expect(res.statusCode).toBe(400);
  });

  test("GET /api/history retourne tableau", async () => {
    const res = await request(app).get("/api/history");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("Paramètres manquants → 400", async () => {
    const res = await request(app)
      .post("/api/calculate")
      .send({ a: 5 });
    expect(res.statusCode).toBe(400);
  });
});
