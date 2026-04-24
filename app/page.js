"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ══════════════════════════════════
   Preset examples
   ══════════════════════════════════ */
const PRESETS = {
  "4 Cities": {
    n: 4,
    dist: [
      [0, 10, 15, 20],
      [10, 0, 35, 25],
      [15, 35, 0, 30],
      [20, 25, 30, 0],
    ],
  },
  "5 Cities": {
    n: 5,
    dist: [
      [0, 20, 42, 35, 12],
      [20, 0, 30, 34, 10],
      [42, 30, 0, 12, 25],
      [35, 34, 12, 0, 30],
      [12, 10, 25, 30, 0],
    ],
  },
  "6 Cities": {
    n: 6,
    dist: [
      [0, 12, 29, 22, 13, 24],
      [12, 0, 19, 3, 25, 6],
      [29, 19, 0, 21, 23, 28],
      [22, 3, 21, 0, 4, 5],
      [13, 25, 23, 4, 0, 16],
      [24, 6, 28, 5, 16, 0],
    ],
  },
};

/* ══════════════════════════════════
   Graph Visualization Component
   ══════════════════════════════════ */
function GraphCanvas({ n, dist, tour }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(W, H) * 0.35;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // City positions (circle layout)
    const positions = [];
    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      positions.push({
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      });
    }

    // Draw all edges (very faint)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        ctx.beginPath();
        ctx.moveTo(positions[i].x, positions[i].y);
        ctx.lineTo(positions[j].x, positions[j].y);
        ctx.stroke();
      }
    }

    // Draw optimal tour edges
    if (tour && tour.length > 1) {
      // Glow layer
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i < tour.length - 1; i++) {
        const from = positions[tour[i]];
        const to = positions[tour[i + 1]];
        if (i === 0) ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
      }
      ctx.stroke();

      // Main line
      const gradient = ctx.createLinearGradient(0, 0, W, H);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.9)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0.85)");
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < tour.length - 1; i++) {
        const from = positions[tour[i]];
        const to = positions[tour[i + 1]];
        if (i === 0) ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
      }
      ctx.stroke();

      // Arrows on tour edges
      for (let i = 0; i < tour.length - 1; i++) {
        const from = positions[tour[i]];
        const to = positions[tour[i + 1]];
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const arrowSize = 8;

        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.beginPath();
        ctx.moveTo(
          midX + arrowSize * Math.cos(angle),
          midY + arrowSize * Math.sin(angle)
        );
        ctx.lineTo(
          midX + arrowSize * Math.cos(angle + 2.5),
          midY + arrowSize * Math.sin(angle + 2.5)
        );
        ctx.lineTo(
          midX + arrowSize * Math.cos(angle - 2.5),
          midY + arrowSize * Math.sin(angle - 2.5)
        );
        ctx.closePath();
        ctx.fill();
      }

      // Edge cost labels
      ctx.font = '600 11px "Inter", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 0; i < tour.length - 1; i++) {
        const from = positions[tour[i]];
        const to = positions[tour[i + 1]];
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const cost = dist[tour[i]][tour[i + 1]];

        // Offset the label perpendicular to the edge
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const offsetX = 14 * Math.cos(angle + Math.PI / 2);
        const offsetY = 14 * Math.sin(angle + Math.PI / 2);

        // Background
        const labelW = ctx.measureText(cost.toString()).width + 10;
        ctx.fillStyle = "rgba(10, 10, 15, 0.85)";
        ctx.beginPath();
        ctx.roundRect(
          midX + offsetX - labelW / 2,
          midY + offsetY - 9,
          labelW,
          18,
          4
        );
        ctx.fill();

        ctx.fillStyle = "#34d399";
        ctx.fillText(cost, midX + offsetX, midY + offsetY);
      }
    }

    // Draw city nodes
    for (let i = 0; i < n; i++) {
      const { x, y } = positions[i];

      // Glow
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 25);
      glow.addColorStop(0, "rgba(255, 255, 255, 0.2)");
      glow.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();

      // Node circle
      const nodeGrad = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, 18);
      nodeGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      nodeGrad.addColorStop(1, "rgba(255, 255, 255, 0.75)");
      ctx.fillStyle = nodeGrad;
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.fillStyle = "black";
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(i.toString(), x, y);
    }
  }, [n, dist, tour]);

  return (
    <div className="graph-canvas-wrapper">
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}

/* ══════════════════════════════════
   Main Page Component
   ══════════════════════════════════ */
export default function Home() {
  const [numCities, setNumCities] = useState(4);
  const [matrix, setMatrix] = useState(PRESETS["4 Cities"].dist);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ---- Matrix helpers ---- */
  const initMatrix = useCallback((size) => {
    return Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) => (i === j ? 0 : ""))
    );
  }, []);

  const handleCityChange = (delta) => {
    const newN = Math.max(2, Math.min(12, numCities + delta));
    setNumCities(newN);
    setMatrix(initMatrix(newN));
    setResult(null);
    setError(null);
  };

  const handleMatrixChange = (i, j, value) => {
    const val = value === "" ? "" : parseInt(value, 10);
    if (value !== "" && isNaN(val)) return;

    const newMatrix = matrix.map((row) => [...row]);
    newMatrix[i][j] = val;
    // Mirror for symmetric TSP
    newMatrix[j][i] = val;
    setMatrix(newMatrix);
  };

  const loadPreset = (name) => {
    const preset = PRESETS[name];
    setNumCities(preset.n);
    setMatrix(preset.dist.map((row) => [...row]));
    setResult(null);
    setError(null);
  };

  /* ---- Solve ---- */
  const handleSolve = async () => {
    // Validate
    for (let i = 0; i < numCities; i++) {
      for (let j = 0; j < numCities; j++) {
        if (i !== j && (matrix[i][j] === "" || matrix[i][j] < 0)) {
          setError("Please fill all distances with non-negative values.");
          return;
        }
      }
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ n: numCities, dist: matrix }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setResult(data);
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      {/* ── Header ── */}
      <header className="header">
        <div className="header__badge">
          <span>Algorithm Visualizer</span>
        </div>
        <h1 className="header__title">Travelling Salesman Problem</h1>
        <p className="header__subtitle">
          Solve TSP using the Held-Karp dynamic programming algorithm.
          Visualize the optimal tour, analyze complexity, and measure
          performance.
        </p>
      </header>

      {/* ── Input + Graph Grid ── */}
      <div className="grid">
        {/* Left: Input Card */}
        <section className="card" style={{ animationDelay: "0.1s" }}>
          <div className="card__header">
            <div className="card__icon">🏙️</div>
            <div>
              <div className="card__title">Configure Cities</div>
              <div className="card__description">
                Set city count and enter distances
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="presets">
            {Object.keys(PRESETS).map((name) => (
              <button
                key={name}
                className="preset-chip"
                onClick={() => loadPreset(name)}
              >
                {name}
              </button>
            ))}
          </div>

          {/* City Count */}
          <div className="input-group">
            <label>Number of Cities</label>
            <div className="city-selector">
              <button onClick={() => handleCityChange(-1)}>−</button>
              <span className="city-selector__value">{numCities}</span>
              <button onClick={() => handleCityChange(1)}>+</button>
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  marginLeft: "8px",
                }}
              >
                max 12
              </span>
            </div>
          </div>

          {/* Distance Matrix */}
          <div className="input-group">
            <label>Distance Matrix</label>
            <div className="matrix-wrapper">
              <table className="matrix-table">
                <thead>
                  <tr>
                    <th></th>
                    {Array.from({ length: numCities }, (_, i) => (
                      <th key={i}>C{i}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: numCities }, (_, i) => (
                    <tr key={i}>
                      <th>{`C${i}`}</th>
                      {Array.from({ length: numCities }, (_, j) => (
                        <td key={j}>
                          <input
                            type="number"
                            min="0"
                            value={matrix[i]?.[j] ?? ""}
                            disabled={i === j}
                            className={
                              result &&
                              result.tour &&
                              isEdgeInTour(result.tour, i, j)
                                ? "highlight"
                                : ""
                            }
                            onChange={(e) =>
                              handleMatrixChange(i, j, e.target.value)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Error */}
          {error && <div className="error-banner">{error}</div>}

          {/* Solve Button */}
          <button
            className="btn btn--primary"
            onClick={handleSolve}
            disabled={loading}
            id="solve-button"
          >
            {loading ? (
              <>
                <div className="spinner" /> Solving...
              </>
            ) : (
              <>🚀 Solve TSP</>
            )}
          </button>
        </section>

        {/* Right: Graph Visualization */}
        <section className="card" style={{ animationDelay: "0.2s" }}>
          <div className="card__header">
            <div className="card__icon">🗺️</div>
            <div>
              <div className="card__title">Graph Visualization</div>
              <div className="card__description">
                {result
                  ? "Optimal tour highlighted"
                  : "Solve to see the optimal path"}
              </div>
            </div>
          </div>

          <GraphCanvas
            n={numCities}
            dist={matrix}
            tour={result ? result.tour : null}
          />
        </section>
      </div>

      {/* ── Results Section ── */}
      {result && (
        <div className="results mt-24">
          <div className="grid">
            {/* Result + Tour */}
            <section className="card" style={{ animationDelay: "0.1s" }}>
              <div className="card__header">
                <div className="card__icon">✅</div>
                <div>
                  <div className="card__title">Solution</div>
                  <div className="card__description">
                    Optimal route and cost breakdown
                  </div>
                </div>
              </div>

              {/* Hero value */}
              <div className="result-hero">
                <div className="result-hero__label">Minimum Cost</div>
                <div className="result-hero__value">{result.minCost}</div>
              </div>

              {/* Tour path */}
              <div className="tour-path">
                {result.tour.map((city, idx) => (
                  <span key={idx} style={{ display: "contents" }}>
                    <span
                      className="tour-node"
                      style={{ animationDelay: `${idx * 0.08}s` }}
                    >
                      {city}
                    </span>
                    {idx < result.tour.length - 1 && (
                      <>
                        <span
                          className="tour-cost"
                          style={{ animationDelay: `${idx * 0.08 + 0.04}s` }}
                        >
                          {result.steps[idx].cost}
                        </span>
                        <span
                          className="tour-arrow"
                          style={{ animationDelay: `${idx * 0.08 + 0.04}s` }}
                        >
                          →
                        </span>
                      </>
                    )}
                  </span>
                ))}
              </div>

              {/* Steps table */}
              <table className="steps-table">
                <thead>
                  <tr>
                    <th>Step</th>
                    <th>Edge</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {result.steps.map((step, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td className="mono">
                        City {step.from} → City {step.to}
                      </td>
                      <td>{step.cost}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td colSpan="2">Total Minimum Cost</td>
                    <td>{result.minCost}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Complexity Analysis */}
            <section className="card" style={{ animationDelay: "0.2s" }}>
              <div className="card__header">
                <div className="card__icon">📊</div>
                <div>
                  <div className="card__title">Complexity Analysis</div>
                  <div className="card__description">
                    Performance metrics for n = {numCities}
                  </div>
                </div>
              </div>

              <div className="complexity-grid">
                <div className="complexity-card">
                  <div className="complexity-card__label">Time Complexity</div>
                  <div className="complexity-card__value complexity-card__value--time">
                    {result.timeComplexity.formula}
                  </div>
                  <div className="complexity-card__detail">
                    {result.timeComplexity.computed}
                  </div>
                </div>

                <div className="complexity-card">
                  <div className="complexity-card__label">Space Complexity</div>
                  <div className="complexity-card__value complexity-card__value--space">
                    {result.spaceComplexity.formula}
                  </div>
                  <div className="complexity-card__detail">
                    {result.spaceComplexity.computed}
                  </div>
                </div>

                <div className="complexity-card">
                  <div className="complexity-card__label">Execution Time</div>
                  <div className="complexity-card__value complexity-card__value--exec">
                    {result.executionTime} ms
                  </div>
                  <div className="complexity-card__detail">
                    Server-side timing
                  </div>
                </div>
              </div>

              {/* Algorithm info */}
              <div
                style={{
                  marginTop: "20px",
                  padding: "20px",
                  background: "var(--bg-glass)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <h3
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: "12px",
                  }}
                >
                  Algorithm: Held-Karp (Bitmask DP)
                </h3>
                <ul
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.8,
                    paddingLeft: "16px",
                  }}
                >
                  <li>
                    Uses bitmask to represent visited city subsets
                  </li>
                  <li>
                    <span className="mono" style={{ color: "var(--text-accent)" }}>
                      dp[mask][i]
                    </span>{" "}
                    = min cost to reach city <em>i</em> with visited set{" "}
                    <em>mask</em>
                  </li>
                  <li>
                    Total DP states:{" "}
                    <span className="mono" style={{ color: "var(--success)" }}>
                      {result.spaceComplexity.entries.toLocaleString()}
                    </span>
                  </li>
                  <li>
                    Total operations ≈{" "}
                    <span className="mono" style={{ color: "var(--warning)" }}>
                      {result.timeComplexity.operations.toLocaleString()}
                    </span>
                  </li>
                  <li>
                    Exponential in n — practical for n ≤ 20
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      )}
    </main>
  );
}

/* ── Helper ── */
function isEdgeInTour(tour, i, j) {
  for (let k = 0; k < tour.length - 1; k++) {
    if (
      (tour[k] === i && tour[k + 1] === j) ||
      (tour[k] === j && tour[k + 1] === i)
    ) {
      return true;
    }
  }
  return false;
}
