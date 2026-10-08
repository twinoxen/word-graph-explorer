# Word Graph Explorer

A playable word ladder beside an interactive graph of valid transformations. Change one letter per move to get from the starting word to the goal. Watch breadth-first search explore the same graph and find a route with the fewest moves.

## Run locally

Requires Node.js 24 or newer.

```sh
npm ci
npm run dev
```

## Features

- Five solvable three- and four-letter puzzles and custom endpoints.
- Case-insensitive move validation against a bundled, curated vocabulary.
- Undo, restart, hint from your current word, and reveal the shortest route from the start.
- p5.js graph with the full connected component; scroll both directions to explore larger graphs.
- Mint player routes, gold shortest routes, purple queue and blue explored nodes. Shared edges retain both mint and gold.
- BFS play/pause, single step, reset and speed; inspect the FIFO queue, current word and depth.
- Mobile layout and keyboard word submission; search state and routes also appear as text outside the canvas.

The vocabulary is a hand-authored teaching set, not an exhaustive dictionary. A word can be valid English and still be absent here. Custom endpoints must be included and of equal length. An unreachable goal produces a no-route message. The graph shows the start word's connected component.

## Verify

```sh
npm test
npm run build
```

GitHub Actions runs both checks on pushes and pull requests.

## Deploy to Vercel

Import `twinoxen/word-graph-explorer` in Vercel. Select Vite, leave the root directory at the repository root, and use `npm run build` with output directory `dist`. No environment variables or database are required. `vercel.json` supplies the build settings.

## Code map

- `src/engine.ts`: pure adjacency, move validation, FIFO BFS snapshots and route reconstruction.
- `src/data.ts`: curated vocabulary and puzzle presets.
- `src/main.ts`: game state, DOM and algorithm playback controls.
- `src/graph.ts`: p5 rendering and node inspection.
- `tests/engine.test.ts`: graph and game rule checks.

Every legal move has equal cost. BFS processes all nodes at distance k before distance k+1, so the first goal reached has the fewest transformations. This small implementation scans the vocabulary to find neighbors: O(V²L) search work, where L is word length. Search snapshots add O(V²) storage in the worst case. Larger dictionaries should use wildcard neighbor indexing and incremental snapshots.
