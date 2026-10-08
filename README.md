# Word Graph Explorer

A word ladder game with optional interactive lessons underneath. Change one letter per move to get from the starting word to the goal. Watch breadth-first search explore the same graph and find a route with the fewest moves.

## Run locally

Requires Node.js 24 or newer.

```sh
npm ci
npm run dev
```

## Play first, explore afterward

The game leads the page, followed by an independent connection map and an optional engineering course. The course has twelve slides in three chapters:

1. **Conceptualize the problem:** distinguish validation, reachability and shortest paths; define adjacency; choose the search state; derive an undirected, unweighted graph with cycles and disconnected vertices.
2. **Choose the data structures:** compare vocabulary arrays, membership sets and adjacency lists; generate neighbors with scans; assign responsibilities to frontier, discovered set, parents and distances; build and query wildcard buckets.
3. **Choose and build the algorithm:** compare DFS and BFS on the same graph; follow a BFS operation trace beside pseudocode; explain the distance-order invariant; reconstruct routes and test solver contracts.

Essential explanations are visible without a quiz gate. Each slide explains what happens, why the design fits, and where its assumptions fail. Predictions provide specific feedback and keep session progress. Experiments include editable character comparisons, representation selection, dictionary-size estimates and route-contract examples.

All walkthroughs play automatically when visible and replay on lesson selection. Leaving a slide disposes its animation timer and observers. Reduced-motion visitors see the completed visual. Chapter tabs support arrow keys, Home and End; sequential navigation focuses the new heading. Teaching state never changes the game or map. The last slide reveals a gameplay route only through an explicit comparison, and that comparison clears when the puzzle or player route changes.

The teaching trace derives neighbors from the game’s adjacency predicate. Unit checks confirm that its parents, distances, pending queue and route agree with the production solver. The DFS counterexample uses the same vocabulary and alphabetical neighbor order. The comparison reveals returned paths rather than suggesting relative execution speeds.

Wildcard indexing is a proposed optimization. Its explanation includes key creation, bucket memberships and candidate processing; displayed lookup counts are not timing measurements. The actual game continues to scan its curated vocabulary. The course credits AlgoMonster’s “DFS vs BFS, When to Use Which?” video as a conceptual reference.

## Features

- Five solvable three- and four-letter puzzles and custom endpoints.
- Square letter tiles show the seed and each accepted rung above a fresh input row. Clicking a tile selects its letter for replacement; typing, deletion, selection and paste use a native textbox.
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
- `src/letter-input.ts`: native keyboard input with square letter slots and selection feedback.
- `src/graph.ts`: p5 rendering and node inspection.
- `src/lessons.ts`: chapter/slide navigation, predictions and explicit puzzle comparison.
- `src/lesson-content.ts`: twelve authored explanations and misconception feedback.
- `src/lesson-model.ts`: pure teaching graph, BFS operation traces and DFS counterexample.
- `src/lesson-visuals.ts`: SVG graphs, synchronized code and data structures, and interactive experiments.
- `src/lesson-animation.ts`: automatic playback, visibility-aware replay and reduced-motion behavior for teaching animations.
- `tests/engine.test.ts`: graph and game rule checks.

Every legal move has equal cost. BFS processes all nodes at distance k before distance k+1, so the first goal reached has the fewest transformations. This small implementation scans the vocabulary to find neighbors: O(V²L) search work, where L is word length. Search snapshots add O(V²) storage in the worst case. Larger dictionaries should use wildcard neighbor indexing and incremental snapshots.

## Interaction feedback

Invalid moves are checked while typing, with a red field and explanation. Submission adds a notification and a brief shake. Valid moves animate into the ladder. Winning displays a persistent celebration card, move count versus the shortest route, confetti, and a next-challenge button. Undo and restart clear celebration state. Active player, solution and BFS frontier edges use marching dashes; current nodes pulse and the graph follows your progress. The operating system's reduced-motion preference removes confetti, dashes in motion, pulses and UI motion while retaining all text feedback.

Browser regression tests:

```sh
npx playwright install chromium
npm run test:e2e
```

Every slide includes an automatic visual walkthrough and an interactive prediction. Switching back to a slide replays its visual; the essential explanation remains visible throughout. Explanatory headings, captions, feedback and paragraphs use complete sentences. Hiding the page pauses teaching animations. Reduced-motion visitors see completed visuals without timed playback.
