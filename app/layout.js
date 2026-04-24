import "./globals.css";

export const metadata = {
  title: "TSP Solver — Dynamic Programming Visualizer",
  description:
    "Solve the Travelling Salesman Problem using the Held-Karp dynamic programming algorithm. Visualize optimal tours, analyze time & space complexity, and measure execution performance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
