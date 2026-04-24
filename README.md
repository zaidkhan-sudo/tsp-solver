# 🗺️ Travelling Salesman Problem — Dynamic Programming Visualizer

A web application that solves the **Travelling Salesman Problem (TSP)** using the **Held-Karp (Bitmask DP)** algorithm. Built with **Next.js** and vanilla CSS.

## 📌 Problem Statement

A salesman must visit a set of **n cities** exactly once and return to the starting city. Given the distances between every pair of cities, find the **shortest possible route** that visits all cities and returns to the origin.

### Example

```
Cities = 4
Distance Matrix:
 0  10  15  20
10   0  35  25
15  35   0  30
20  25  30   0

Output:
Minimum cost = 80
Optimal tour = 0 → 1 → 3 → 2 → 0

Explanation:
0→1 (10) + 1→3 (25) + 3→2 (30) + 2→0 (15) = 80
```

## ✨ Features

- **Interactive Distance Matrix** — Adjust city count (2–12) and enter distances manually
- **Preset Examples** — Quick-load 4, 5, or 6 city configurations
- **Graph Visualization** — Canvas-based graph with cities and optimal tour highlighted
- **Step-by-Step Breakdown** — Detailed cost table for each edge in the tour
- **Complexity Analysis** — Displays time and space complexity with computed values for given n
- **Execution Time** — Server-side performance timing in milliseconds
- **Algorithm Details** — Explanation of the Held-Karp bitmask DP approach

## 🧠 Algorithm: Held-Karp (Bitmask DP)

| Metric | Complexity |
|--------|-----------|
| **Time** | O(n² × 2ⁿ) |
| **Space** | O(n × 2ⁿ) |

- Uses a **bitmask** to represent the set of visited cities
- `dp[mask][i]` = minimum cost to reach city `i` with the visited set represented by `mask`
- Reconstructs the optimal tour by backtracking through the parent table
- Practical for **n ≤ 20** cities

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm**

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd tsp-web

# Install dependencies
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
tsp-web/
├── app/
│   ├── api/
│   │   └── solve/
│   │       └── route.js       # API endpoint — Held-Karp TSP solver
│   ├── globals.css            # Global styles (dark theme)
│   ├── layout.js              # Root layout with metadata
│   └── page.js                # Main page — UI, matrix input, graph, results
├── public/                    # Static assets
├── package.json
└── README.md
```

## 🔌 API

### `POST /api/solve`

**Request Body:**
```json
{
  "n": 4,
  "dist": [
    [0, 10, 15, 20],
    [10, 0, 35, 25],
    [15, 35, 0, 30],
    [20, 25, 30, 0]
  ]
}
```

**Response:**
```json
{
  "minCost": 80,
  "tour": [0, 2, 3, 1, 0],
  "steps": [
    { "from": 0, "to": 2, "cost": 15 },
    { "from": 2, "to": 3, "cost": 30 },
    { "from": 3, "to": 1, "cost": 25 },
    { "from": 1, "to": 0, "cost": 10 }
  ],
  "timeComplexity": {
    "formula": "O(n² × 2ⁿ)",
    "computed": "O(16 × 16) = O(256)",
    "operations": 256
  },
  "spaceComplexity": {
    "formula": "O(n × 2ⁿ)",
    "computed": "O(4 × 16) = O(64)",
    "entries": 64
  },
  "executionTime": "0.0186"
}
```

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** JavaScript (JSX)
- **Styling:** Vanilla CSS (dark theme, glassmorphism, animations)
- **Visualization:** HTML5 Canvas
- **Fonts:** Inter, JetBrains Mono (Google Fonts)
