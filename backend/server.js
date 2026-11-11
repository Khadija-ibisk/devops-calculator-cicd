const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── Root ──────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "DevOps Calculator API Running",
    version: "1.0.0",
    endpoints: ["/api/calculate", "/api/history", "/health"],
  });
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "healthy", uptime: process.uptime(), port: PORT });
});

// ── In-memory history (remplace par MongoDB en prod) ──────────────────────────
let history = [];

// ── Calculate ─────────────────────────────────────────────────────────────────
app.post("/api/calculate", (req, res) => {
  const { a, b, operator } = req.body;

  if (a === undefined || b === undefined || !operator) {
    return res.status(400).json({ error: "Paramètres manquants: a, b, operator" });
  }

  const numA = parseFloat(a);
  const numB = parseFloat(b);

  if (isNaN(numA) || isNaN(numB)) {
    return res.status(400).json({ error: "a et b doivent être des nombres" });
  }

  let result;
  let expression;

  switch (operator) {
    case "+":
      result = numA + numB;
      expression = `${numA} + ${numB}`;
      break;
    case "-":
      result = numA - numB;
      expression = `${numA} - ${numB}`;
      break;
    case "*":
      result = numA * numB;
      expression = `${numA} × ${numB}`;
      break;
    case "/":
      if (numB === 0) return res.status(400).json({ error: "Division par zéro impossible" });
      result = numA / numB;
      expression = `${numA} ÷ ${numB}`;
      break;
    case "%":
      if (numB === 0) return res.status(400).json({ error: "Modulo par zéro impossible" });
      result = numA % numB;
      expression = `${numA} % ${numB}`;
      break;
    case "**":
      result = Math.pow(numA, numB);
      expression = `${numA} ^ ${numB}`;
      break;
    default:
      return res.status(400).json({ error: `Opérateur inconnu: ${operator}` });
  }

  const entry = {
    id: Date.now(),
    expression,
    result: parseFloat(result.toFixed(10)),
    timestamp: new Date().toISOString(),
  };

  history.unshift(entry);
  if (history.length > 20) history = history.slice(0, 20);

  res.json(entry);
});

// ── History ───────────────────────────────────────────────────────────────────
app.get("/api/history", (req, res) => {
  res.json(history);
});

app.delete("/api/history", (req, res) => {
  history = [];
  res.json({ message: "Historique effacé" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});
