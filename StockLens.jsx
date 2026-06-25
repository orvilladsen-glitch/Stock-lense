import { useState, useRef } from "react";

const EXAMPLES = ["AAPL", "NVDA", "TSLA", "NOVO-B.CO", "MSFT", "AMZN"];

function ScoreRing({ score }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 70 ? "#22c55e" : score >= 45 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
      <svg viewBox="0 0 100 100" width="110" height="110" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1a1a24" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 26, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  );
}

function Bar({ name, score }) {
  const color = score >= 70 ? "#22c55e" : score >= 45 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
        <span style={{ color: "#f0f0f8" }}>{name}</span>
        <span style={{ fontFamily: "monospace", color: "#6b7280", fontSize: 12 }}>{score}/100</span>
      </div>
      <div style={{ height: 6, background: "#1a1a24", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: 3, transition: "width 1s ease" }} />
      </div>
    </div>
  );
}

function MetricCard({ label, value, assessment, note }) {
  const color = assessment === "good" ? "#22c55e" : assessment === "bad" ? "#ef4444" : "#a78bfa";
  return (
    <div style={{ background: "#111118", border: "1px solid #2a2a3a", borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "monospace", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{note}</div>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div style={{ background: "#111118", border: "1px solid #2a2a3a", borderRadius: 16, padding: 28, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #2a2a3a" }}>
        <div style={{ width: 36, height: 36, background: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{icon}</div>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>
      </div>
      {children}
    </div>
  );
}

export default function StockLens() {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const steps = ["Søger aktiedata...", "Vurderer finansiel styrke...", "Beregner risikoprofil...", "Genererer AI-analyse..."];

  async function analyze() {
    const t = ticker.trim().toUpperCase();
    if (!t) return;
    setLoading(true);
    setResult(null);
    setError("");
    setLoadStep(0);

    const interval = setInterval(() => setLoadStep(s => Math.min(s + 1, 3)), 800);

    const prompt = `Du er en professionel aktieanalytiker med adgang til opdateret markedsviden. Analyser aktien: ${t}

Returner KUN et JSON-objekt uden markdown-formatering. Brug denne struktur:

{
  "ticker": "${t}",
  "companyName": "Fuldt firmanavn",
  "overallScore": 72,
  "rating": "HOLD",
  "verdict": "2-3 sætninger der opsummerer aktiens overordnede situation og attraktivitet.",
  "metrics": {
    "pe": {"value": "24.5x", "label": "P/E Ratio", "assessment": "good", "note": "Under sektorgennemsnit"},
    "revenue_growth": {"value": "+12%", "label": "Omsætningsvækst YoY", "assessment": "good", "note": "Stærk organisk vækst"},
    "profit_margin": {"value": "22%", "label": "Nettomarginal", "assessment": "good", "note": "Over industrinorm"},
    "debt_equity": {"value": "0.45", "label": "Gæld/Egenkapital", "assessment": "neutral", "note": "Håndterbart gældsniveau"}
  },
  "fundamentals": {"score": 75, "description": "3-4 sætninger om økonomi og balance."},
  "growth": {"score": 68, "description": "3-4 sætninger om vækstpotentiale."},
  "risk": {"level": "MODERAT", "score": 55, "description": "3-4 sætninger om primære risici."},
  "valuation": {"score": 60, "description": "3-4 sætninger om prissætning ift. fair value."},
  "pros": ["Styrke 1", "Styrke 2", "Styrke 3"],
  "cons": ["Risiko 1", "Risiko 2", "Risiko 3"],
  "dimensions": [
    {"name": "Finansiel styrke", "score": 78},
    {"name": "Vækstpotentiale", "score": 65},
    {"name": "Ledelseskvalitet", "score": 80},
    {"name": "Konkurrenceposition", "score": 72},
    {"name": "Aktionærværdi", "score": 60}
  ]
}

Rating skal være én af: "STÆRK KØB", "KØB", "HOLD", "SÆLG", "STÆRKT SÆLG". Alle scores 0-100. Svar KUN med JSON, ingen forklaringer.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const text = data.content.map(b => b.type === "text" ? b.text : "").join("");
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Ugyldigt svar fra AI");

      const analysis = JSON.parse(match[0]);
      setResult(analysis);
    } catch (err) {
      setError(`Fejl: ${err.message}. Tjek at ticker-symbolet er korrekt (fx AAPL, NVDA, NOVO-B.CO).`);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  const ratingColor = (r = "") => {
    const u = r.toUpperCase();
    if (u.includes("KØB")) return "#22c55e";
    if (u.includes("HOLD")) return "#f59e0b";
    return "#ef4444";
  };

  const riskColor = (l = "") => {
    const u = l.toUpperCase();
    if (u.includes("LAV")) return "#22c55e";
    if (u.includes("HØJ") || u.includes("KRITISK")) return "#ef4444";
    return "#f59e0b";
  };

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#f0f0f8", fontFamily: "Inter, sans-serif", padding: "0 0 48px" }}>
      {/* Header */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", padding: "48px 0 32px" }}>
          <div style={{ fontSize: 12, letterSpacing: "0.2em", color: "#a78bfa", marginBottom: 16, textTransform: "uppercase" }}>● StockLens ●</div>
          <h1 style={{ fontSize: "clamp(32px,6vw,52px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.05, marginBottom: 14 }}>
            AI-drevet <span style={{ background: "linear-gradient(135deg,#6c63ff,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>aktieanalyse</span>
          </h1>
          <p style={{ color: "#6b7280", fontSize: 16, maxWidth: 460, margin: "0 auto", lineHeight: 1.6 }}>
            Indtast et ticker-symbol og få en kritisk AI-vurdering af aktiens styrke, risiko og potentiale.
          </p>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 10, background: "#111118", border: "1px solid #2a2a3a", borderRadius: 14, padding: "8px 8px 8px 20px" }}>
            <input
              value={ticker}
              onChange={e => setTicker(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && analyze()}
              placeholder="Fx AAPL, NVDA, TSLA, NOVO-B.CO ..."
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#f0f0f8", fontFamily: "monospace", fontSize: 18, fontWeight: 600, letterSpacing: "0.05em" }}
            />
            <button
              onClick={analyze}
              disabled={loading}
              style={{ background: loading ? "#3a3a5a" : "#6c63ff", color: "white", border: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s", whiteSpace: "nowrap" }}
            >
              {loading ? "Analyserer..." : "Analysér →"}
            </button>
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>Prøv:</span>
            {EXAMPLES.map(ex => (
              <button key={ex} onClick={() => setTicker(ex)}
                style={{ fontFamily: "monospace", fontSize: 12, color: "#6b7280", background: "#111118", border: "1px solid #2a2a3a", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ width: 40, height: 40, border: "2px solid #2a2a3a", borderTopColor: "#6c63ff", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ fontFamily: "monospace", fontSize: 13, color: "#6b7280", marginBottom: 12 }}>Analyserer {ticker}...</div>
            {steps.map((s, i) => (
              <div key={i} style={{ fontSize: 12, fontFamily: "monospace", color: i <= loadStep ? "#a78bfa" : "#2a2a3a", marginBottom: 4, transition: "color 0.3s" }}>
                {i <= loadStep ? "▸" : "◦"} {s}
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "16px 20px", color: "#fca5a5", fontSize: 14, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div>
            {/* Score card */}
            <div style={{ background: "#111118", border: "1px solid #2a2a3a", borderRadius: 16, padding: 32, marginBottom: 20, display: "flex", alignItems: "center", gap: 28, position: "relative", overflow: "hidden", flexWrap: "wrap" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#6c63ff,#a78bfa)" }} />
              <ScoreRing score={result.overallScore} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: "#a78bfa", letterSpacing: "0.1em", marginBottom: 6 }}>{result.ticker}</div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{result.companyName}</div>
                <div style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.6, marginBottom: 12 }}>{result.verdict}</div>
                <span style={{ display: "inline-block", fontFamily: "monospace", fontSize: 11, fontWeight: 600, padding: "4px 14px", borderRadius: 20, background: `${ratingColor(result.rating)}22`, color: ratingColor(result.rating), border: `1px solid ${ratingColor(result.rating)}55`, letterSpacing: "0.05em" }}>
                  {result.rating}
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 20 }}>
              {Object.values(result.metrics || {}).map((m, i) => <MetricCard key={i} {...m} />)}
            </div>

            {/* Dimensions */}
            <Section icon="📊" title="Styrkedimensioner">
              {(result.dimensions || []).map((d, i) => <Bar key={i} name={d.name} score={d.score} />)}
            </Section>

            {/* Fundamentals */}
            <Section icon="🏛️" title="Fundamentale forhold">
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#c4c4d4" }}>{result.fundamentals?.description}</p>
            </Section>

            {/* Growth */}
            <Section icon="🚀" title="Vækst & fremtidspotentiale">
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#c4c4d4" }}>{result.growth?.description}</p>
            </Section>

            {/* Risk */}
            <Section icon="⚠️" title="Risikoprofil">
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#c4c4d4", marginBottom: 16 }}>{result.risk?.description}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>Lav</span>
                <div style={{ flex: 1, display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 2 }}>
                  {Array.from({ length: 5 }, (_, i) => {
                    const lvl = (result.risk?.level || "").toUpperCase();
                    const threshold = lvl.includes("LAV") ? 2 : lvl.includes("HØJ") || lvl.includes("KRITISK") ? 5 : 3;
                    return <div key={i} style={{ flex: 1, height: "100%", background: i < threshold ? riskColor(result.risk?.level) : "#1a1a24", transition: "background 0.5s" }} />;
                  })}
                </div>
                <span style={{ fontSize: 12, color: "#6b7280" }}>Høj</span>
                <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: riskColor(result.risk?.level), minWidth: 60 }}>{result.risk?.level}</span>
              </div>
            </Section>

            {/* Valuation */}
            <Section icon="💰" title="Værdiansættelse">
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#c4c4d4" }}>{result.valuation?.description}</p>
            </Section>

            {/* Pros/Cons */}
            <Section icon="⚖️" title="Styrker & svagheder">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "monospace", marginBottom: 12 }}>Styrker</div>
                  {(result.pros || []).map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, lineHeight: 1.5, color: "#c4c4d4", paddingBottom: 10, marginBottom: 10, borderBottom: "1px solid #1a1a24" }}>
                      <span style={{ color: "#22c55e", flexShrink: 0 }}>↑</span>{p}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "monospace", marginBottom: 12 }}>Svagheder</div>
                  {(result.cons || []).map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, lineHeight: 1.5, color: "#c4c4d4", paddingBottom: 10, marginBottom: 10, borderBottom: "1px solid #1a1a24" }}>
                      <span style={{ color: "#ef4444", flexShrink: 0 }}>↓</span>{c}
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            <div style={{ textAlign: "center", fontSize: 12, color: "#4b5563", lineHeight: 1.6 }}>
              ⚠️ StockLens er et informationsværktøj og udgør ikke investeringsrådgivning. Invester altid på eget ansvar.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
