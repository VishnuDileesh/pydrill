# PyDrill

Learn Python by doing, not reading. PyDrill is a frontend-only site with 110
small, verified Python challenges across 6 modules — strings, math, lists,
dicts, patterns/matrices, and recursion/algorithms. Code runs entirely in the
browser via [Pyodide](https://pyodide.org/) (Python compiled to WebAssembly),
so there's nothing to install and no backend involved.

## Features

- **110 challenges**, each with a prompt, starter code, and a set of test
  cases checked against a verified reference solution.
- **In-browser execution** — write Python, hit Run or Run Tests, see results
  instantly. No signup, no server round-trip.
- **Playground** — a free-form scratch editor with no tests, for open-ended
  tinkering.
- **Progress tracking** — completions and a daily streak are stored in
  `localStorage`, with a dedicated Progress page for per-module breakdowns.
- **"Surprise me"** — jumps to a random unsolved challenge, for practice
  without following a fixed order.

## Stack

- [Astro](https://astro.build) — static site generation, zero client JS
  framework overhead.
- [Pyodide](https://pyodide.org/) — loaded from CDN on first Run, cached for
  the rest of the session.
- Plain CSS + vanilla JS for interactivity — no UI framework.

## Development

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs to ./dist
npm run preview   # preview the production build
```

## Project structure

```text
src/
├── data/challenges.json    # all 110 challenges: prompt, starter code, tests
├── lib/                    # challenge data helpers
├── layouts/Base.astro      # app shell: sidebar nav, streak badge
└── pages/
    ├── index.astro         # home: modules grid, progress, surprise-me
    ├── modules/[slug].astro
    ├── challenge/[id].astro # the code editor + test runner
    ├── playground.astro
    └── progress.astro
```

Challenge data (`src/data/challenges.json`) was generated from Python
reference solutions and test cases verified end-to-end against the actual
Pyodide runtime, so every test case is guaranteed solvable.
