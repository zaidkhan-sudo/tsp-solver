import { NextResponse } from "next/server";

/**
 * TSP Solver using Held-Karp (Bitmask DP) Algorithm
 *
 * Time Complexity:  O(n² × 2ⁿ)
 * Space Complexity: O(n × 2ⁿ)
 */

function solveTSP(n, dist) {
  const FULL_MASK = (1 << n) - 1;
  const INF = Number.MAX_SAFE_INTEGER;

  // dp[mask][i] = minimum cost to reach city i having visited the set of cities in mask
  const dp = Array.from({ length: 1 << n }, () => new Array(n).fill(INF));
  const parent = Array.from({ length: 1 << n }, () => new Array(n).fill(-1));

  // Start at city 0
  dp[1][0] = 0;

  for (let mask = 1; mask <= FULL_MASK; mask++) {
    for (let u = 0; u < n; u++) {
      if (!(mask & (1 << u))) continue; // u not in mask
      if (dp[mask][u] === INF) continue;

      for (let v = 0; v < n; v++) {
        if (mask & (1 << v)) continue; // v already visited
        const newMask = mask | (1 << v);
        const newCost = dp[mask][u] + dist[u][v];

        if (newCost < dp[newMask][v]) {
          dp[newMask][v] = newCost;
          parent[newMask][v] = u;
        }
      }
    }
  }

  // Find minimum cost to return to city 0
  let minCost = INF;
  let lastCity = -1;

  for (let u = 1; u < n; u++) {
    const cost = dp[FULL_MASK][u] + dist[u][0];
    if (cost < minCost) {
      minCost = cost;
      lastCity = u;
    }
  }

  // Reconstruct tour
  const tour = [0];
  let mask = FULL_MASK;
  let current = lastCity;

  const path = [];
  while (current !== -1 && current !== 0) {
    path.push(current);
    const prev = parent[mask][current];
    mask = mask ^ (1 << current);
    current = prev;
  }

  path.reverse();
  tour.push(...path);
  tour.push(0);

  // Build step-by-step breakdown
  const steps = [];
  for (let i = 0; i < tour.length - 1; i++) {
    const from = tour[i];
    const to = tour[i + 1];
    steps.push({
      from,
      to,
      cost: dist[from][to],
    });
  }

  // Complexity analysis
  const timeComplexity = {
    formula: "O(n² × 2ⁿ)",
    n: n,
    computed: `O(${n * n} × ${1 << n}) = O(${n * n * (1 << n)})`,
    operations: n * n * (1 << n),
  };

  const spaceComplexity = {
    formula: "O(n × 2ⁿ)",
    n: n,
    computed: `O(${n} × ${1 << n}) = O(${n * (1 << n)})`,
    entries: n * (1 << n),
  };

  return {
    minCost,
    tour,
    steps,
    timeComplexity,
    spaceComplexity,
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { n, dist } = body;

    if (!n || !dist || n < 2 || n > 20) {
      return NextResponse.json(
        { error: "Invalid input. n must be between 2 and 20." },
        { status: 400 }
      );
    }

    // Validate matrix dimensions
    if (dist.length !== n || dist.some((row) => row.length !== n)) {
      return NextResponse.json(
        { error: "Distance matrix dimensions must match n." },
        { status: 400 }
      );
    }

    const startTime = performance.now();
    const result = solveTSP(n, dist);
    const endTime = performance.now();

    return NextResponse.json({
      ...result,
      executionTime: (endTime - startTime).toFixed(4),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
