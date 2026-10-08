# Word Graph Explorer Implementation Plan
Goal: playable word ladders with an inspectable BFS visualization.
Architecture: pure graph/game engine, curated data, DOM controller and independent p5 renderer.
Tech Stack: Vite, TypeScript, p5.js, Node test runner.
Spec: docs/design.md

Global constraints: browser only; valid one-letter edges; hints from current position; distinct player/optimal routes; responsive controls; no hidden solution before reveal/search completion.
Review focus: mixed case input; unequal lengths; disconnected goals; cycles in player route; reset while animation runs.

1. Engine — src/engine.ts and tests/engine.test.ts. Exports adjacent(a,b), search(start,goal,words), validateMove(current,next,words), shortestPath(start,goal,words). Write failing tests; run npm test; implement FIFO BFS snapshots with parent map; rerun tests.
2. Data and UI — src/data.ts, src/main.ts, src/graph.ts, src/style.css, index.html. Presets all have a route. Wire form validation, hints, reveal, undo/reset, custom words, BFS controls and graph. Verify actual game interactions and mobile layout.
3. Ship — README.md, vercel.json, GitHub Actions checks. Run npm test and npm run build; review source, verify browser; upload tracked text files in one commit to the new repository.
