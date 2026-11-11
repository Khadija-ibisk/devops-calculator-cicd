import React, { useState, useEffect, useCallback } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── CSS injected globally ─────────────────────────────────────────────────────
const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #0a0a0f;
    --surface:   #111118;
    --card:      #16161f;
    --border:    #1e1e2e;
    --accent:    #7c6aff;
    --accent2:   #ff6a9b;
    --accent3:   #6affce;
    --text:      #e8e8f0;
    --muted:     #6b6b8a;
    --op-bg:     #1e1830;
    --eq-bg:     linear-gradient(135deg, #7c6aff, #ff6a9b);
    --num-bg:    #181826;
    --num-hover: #1f1f32;
    --red:       #ff5a7e;
    --font-mono: 'DM Mono', monospace;
    --font-disp: 'Syne', sans-serif;
    --radius:    14px;
    --shadow:    0 24px 64px rgba(0,0,0,0.6);
  }

  html, body, #root {
    height: 100%;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-mono);
    -webkit-font-smoothing: antialiased;
  }

  body {
    background-image:
      radial-gradient(ellipse 80% 60% at 20% -10%, rgba(124,106,255,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 110%, rgba(255,106,155,0.10) 0%, transparent 60%);
  }

  /* ── Layout ── */
  .layout {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 360px;
    grid-template-rows: auto 1fr;
    gap: 0;
    max-width: 900px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem;
  }

  @media (max-width: 700px) {
    .layout { grid-template-columns: 1fr; padding: 1.2rem; }
    .history-panel { grid-column: 1; }
  }

  /* ── Header ── */
  .header {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .logo {
    width: 42px; height: 42px;
    background: var(--eq-bg);
    border-radius: 12px;
    display: grid;
    place-items: center;
    font-size: 1.3rem;
    flex-shrink: 0;
  }

  .header-text h1 {
    font-family: var(--font-disp);
    font-size: 1.4rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    background: var(--eq-bg);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-text p {
    font-size: 0.72rem;
    color: var(--muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .status-dot {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.72rem;
    color: var(--muted);
  }

  .dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--accent3);
    animation: pulse 2.5s ease-in-out infinite;
  }

  .dot.offline { background: var(--red); animation: none; }

  @keyframes pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(106,255,206,0.4); }
    50% { opacity: 0.6; box-shadow: 0 0 0 6px rgba(106,255,206,0); }
  }

  /* ── Calculator card ── */
  .calc-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
  }

  /* ── Display ── */
  .display {
    padding: 1.8rem 1.8rem 1.2rem;
    min-height: 140px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    position: relative;
    overflow: hidden;
  }

  .display::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at top right, rgba(124,106,255,0.06), transparent 60%);
    pointer-events: none;
  }

  .display-expr {
    font-size: 0.78rem;
    color: var(--muted);
    min-height: 1.2em;
    margin-bottom: 0.4rem;
    letter-spacing: 0.05em;
    transition: all 0.2s;
  }

  .display-main {
    font-size: clamp(2rem, 8vw, 3.2rem);
    font-weight: 500;
    letter-spacing: -0.03em;
    color: var(--text);
    word-break: break-all;
    line-height: 1;
    transition: all 0.15s cubic-bezier(0.34,1.56,0.64,1);
  }

  .display-main.flash {
    color: var(--accent3);
    transform: scale(1.02);
  }

  .display-error {
    font-size: 0.9rem;
    color: var(--red);
    margin-top: 0.4rem;
    min-height: 1.2em;
    font-weight: 300;
  }

  /* ── Grid buttons ── */
  .btn-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: var(--border);
    flex: 1;
  }

  .btn {
    all: unset;
    cursor: pointer;
    display: grid;
    place-items: center;
    font-family: var(--font-mono);
    font-size: 1.1rem;
    font-weight: 400;
    height: 68px;
    background: var(--num-bg);
    color: var(--text);
    position: relative;
    overflow: hidden;
    transition: background 0.12s, color 0.12s, transform 0.08s;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0);
    transition: background 0.1s;
  }

  .btn:hover { background: var(--num-hover); }
  .btn:active { transform: scale(0.94); }
  .btn:active::after { background: rgba(255,255,255,0.04); }

  .btn.op {
    background: var(--op-bg);
    color: var(--accent);
    font-size: 1.3rem;
  }
  .btn.op:hover { background: #26204a; }

  .btn.func {
    background: #141420;
    color: var(--muted);
    font-size: 0.82rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .btn.func:hover { background: #1a1a2a; color: var(--text); }

  .btn.func.red { color: var(--red); }
  .btn.func.orange { color: #ff9a6c; }

  .btn.eq {
    background: var(--eq-bg);
    color: white;
    font-size: 1.5rem;
    font-weight: 700;
  }
  .btn.eq:hover { opacity: 0.9; }

  .btn.span2 { grid-column: span 2; }

  /* ── History panel ── */
  .history-panel {
    padding-left: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @media (max-width: 700px) {
    .history-panel { padding-left: 0; padding-top: 1.2rem; }
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 0.5rem;
  }

  .panel-title {
    font-family: var(--font-disp);
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted);
  }

  .clear-btn {
    all: unset;
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--muted);
    padding: 0.3rem 0.7rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    transition: all 0.15s;
  }
  .clear-btn:hover { color: var(--red); border-color: var(--red); }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow-y: auto;
    max-height: 480px;
    padding-right: 2px;
  }

  .history-list::-webkit-scrollbar { width: 3px; }
  .history-list::-webkit-scrollbar-track { background: transparent; }
  .history-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .history-item {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.85rem 1rem;
    cursor: pointer;
    transition: all 0.15s;
    animation: slideIn 0.25s ease;
  }

  .history-item:hover {
    border-color: var(--accent);
    background: var(--op-bg);
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(12px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .h-expr {
    font-size: 0.72rem;
    color: var(--muted);
    margin-bottom: 0.3rem;
  }

  .h-result {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--accent3);
  }

  .h-time {
    font-size: 0.62rem;
    color: var(--muted);
    margin-top: 0.2rem;
    opacity: 0.6;
  }

  .empty-history {
    color: var(--muted);
    font-size: 0.78rem;
    text-align: center;
    padding: 2rem 0;
    border: 1px dashed var(--border);
    border-radius: var(--radius);
    line-height: 2;
  }

  /* ── Loading ── */
  .loading-spinner {
    width: 18px; height: 18px;
    border: 2px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (v) => {
  if (v === "" || v === "-") return v;
  const n = parseFloat(v);
  if (isNaN(n)) return v;
  if (Number.isInteger(n) && Math.abs(n) < 1e12) return n.toLocaleString("fr-FR");
  return n.toPrecision(10).replace(/\.?0+$/, "");
};

const fmtTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [display, setDisplay] = useState("0");
  const [expr, setExpr] = useState("");
  const [operandA, setOperandA] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingB, setWaitingB] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState(false);
  const [online, setOnline] = useState(true);

  // Check backend health
  useEffect(() => {
    fetch(`${API}/health`)
      .then((r) => r.ok && setOnline(true))
      .catch(() => setOnline(false));
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const r = await fetch(`${API}/api/history`);
      const data = await r.json();
      setHistory(data);
    } catch { setOnline(false); }
  };

  const triggerFlash = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
  };

  const pressDigit = useCallback((d) => {
    setError("");
    if (waitingB) {
      setDisplay(d === "." ? "0." : d);
      setWaitingB(false);
    } else {
      if (d === "." && display.includes(".")) return;
      setDisplay((p) => {
        if (p === "0" && d !== ".") return d;
        if (p.length >= 14) return p;
        return p + d;
      });
    }
  }, [display, waitingB]);

  const pressOp = useCallback((op) => {
    setError("");
    setOperandA(parseFloat(display));
    setOperator(op);
    setExpr(`${display} ${op}`);
    setWaitingB(true);
  }, [display]);

  const pressEquals = useCallback(async () => {
    if (operator === null || operandA === null) return;
    setError("");
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: operandA, b: parseFloat(display), operator }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error); setLoading(false); return; }
      setDisplay(String(data.result));
      setExpr(data.expression + " =");
      setOperator(null);
      setOperandA(null);
      setWaitingB(false);
      triggerFlash();
      fetchHistory();
      setOnline(true);
    } catch { setError("Impossible de contacter le backend"); setOnline(false); }
    setLoading(false);
  }, [operator, operandA, display]);

  const pressClear = () => {
    setDisplay("0"); setExpr(""); setOperandA(null);
    setOperator(null); setWaitingB(false); setError("");
  };

  const pressCE = () => { setDisplay("0"); setError(""); };

  const pressSign = () => {
    setDisplay((p) => p.startsWith("-") ? p.slice(1) : "-" + p);
  };

  const pressPct = () => {
    setDisplay((p) => String(parseFloat(p) / 100));
  };

  const pressBackspace = () => {
    setDisplay((p) => p.length <= 1 ? "0" : p.slice(0, -1));
  };

  const clearHistory = async () => {
    await fetch(`${API}/api/history`, { method: "DELETE" });
    setHistory([]);
  };

  const loadFromHistory = (item) => {
    setDisplay(String(item.result));
    setExpr("");
    setOperandA(null);
    setOperator(null);
    setWaitingB(false);
    setError("");
  };

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if ("0123456789.".includes(e.key)) pressDigit(e.key);
      else if (["+", "-", "*", "/", "%"].includes(e.key)) pressOp(e.key);
      else if (e.key === "Enter" || e.key === "=") pressEquals();
      else if (e.key === "Backspace") pressBackspace();
      else if (e.key === "Escape") pressClear();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [pressDigit, pressOp, pressEquals]);

  const B = ({ label, onClick, className = "", span2 = false }) => (
    <button
      className={`btn ${className} ${span2 ? "span2" : ""}`}
      onClick={onClick}
    >{label}</button>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="layout">
        {/* Header */}
        <header className="header">
          <div className="logo">⊕</div>
          <div className="header-text">
            <h1>DevCalc</h1>
            <p>B3 DevOps — Ynov Campus Maroc</p>
          </div>
          <div className="status-dot">
            <div className={`dot ${online ? "" : "offline"}`} />
            {online ? "Backend connecté" : "Hors ligne"}
          </div>
        </header>

        {/* Calculator */}
        <main className="calc-card">
          <div className="display">
            <div className="display-expr">{expr || "\u00A0"}</div>
            <div className={`display-main ${flash ? "flash" : ""}`}>
              {loading
                ? <span className="loading-spinner" />
                : fmt(display)}
            </div>
            <div className="display-error">{error || "\u00A0"}</div>
          </div>

          <div className="btn-grid">
            {/* Row 1 */}
            <B label="AC"  onClick={pressClear}     className="func red" />
            <B label="CE"  onClick={pressCE}         className="func orange" />
            <B label="⌫"  onClick={pressBackspace}   className="func" />
            <B label="÷"  onClick={() => pressOp("/")} className="op" />
            {/* Row 2 */}
            <B label="7"  onClick={() => pressDigit("7")} />
            <B label="8"  onClick={() => pressDigit("8")} />
            <B label="9"  onClick={() => pressDigit("9")} />
            <B label="×"  onClick={() => pressOp("*")} className="op" />
            {/* Row 3 */}
            <B label="4"  onClick={() => pressDigit("4")} />
            <B label="5"  onClick={() => pressDigit("5")} />
            <B label="6"  onClick={() => pressDigit("6")} />
            <B label="−"  onClick={() => pressOp("-")} className="op" />
            {/* Row 4 */}
            <B label="1"  onClick={() => pressDigit("1")} />
            <B label="2"  onClick={() => pressDigit("2")} />
            <B label="3"  onClick={() => pressDigit("3")} />
            <B label="+"  onClick={() => pressOp("+")} className="op" />
            {/* Row 5 */}
            <B label="+/−" onClick={pressSign}       className="func" />
            <B label="0"  onClick={() => pressDigit("0")} />
            <B label="%"  onClick={pressPct}         className="func" />
            <B label="="  onClick={pressEquals}      className="eq" />
          </div>
        </main>

        {/* History */}
        <aside className="history-panel">
          <div className="panel-header">
            <span className="panel-title">Historique</span>
            {history.length > 0 && (
              <button className="clear-btn" onClick={clearHistory}>Effacer</button>
            )}
          </div>
          <div className="history-list">
            {history.length === 0 ? (
              <div className="empty-history">
                Aucun calcul<br />pour l'instant
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="history-item"
                  onClick={() => loadFromHistory(item)}
                  title="Cliquer pour réutiliser"
                >
                  <div className="h-expr">{item.expression}</div>
                  <div className="h-result">= {fmt(String(item.result))}</div>
                  <div className="h-time">{fmtTime(item.timestamp)}</div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
