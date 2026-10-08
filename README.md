# Word Graph Explorer

A word ladder game with optional interactive lessons underneath. Change one letter per move to get from the starting word to the goal. Watch breadth-first search explore the same graph and find a route with the fewest moves.

## Run locally

Requires Node.js 24 or newer.

```sh
npm ci
npm run dev
```

## Play first, explore afterward

The game leads the page: choose a challenge, change one letter per move, and build a ladder to the goal. An independent connection map follows the game, with its own BFS playback controls. The optional learning section comes after the map and has four independent modules:

1. **Words become a graph:** predict a legal connection, then explore nodes and edges.
2. **Search in rings:** predict FIFO order and step through a six-word queue. The search animation and queue walkthrough use an independent teaching example.
3. **Shortest route:** follow recorded parents backward, reverse the route, and optionally compare it with the active puzzle.
4. **Scale it up:** adjust dictionary size to compare character-check bounds with indexed bucket lookups. Explain indexing costs, candidate processing, search complexity and snapshot storage.

Each module gives feedback on predictions and reveals an explanation after a correct answer. Lesson examples do not modify the game. The comparison explicitly reveals the puzzle solution and clears on a new puzzle or move. Progress lasts for the current page session. Tabs support arrow keys, Home and End. Graph code loads when the map approaches the viewport. Lesson selection does not hide the map or control its playback.

The scaling module shows operation counts rather than timing measurements. Wildcard indexing is a proposed optimization; the actual game still scans the curated vocabulary.

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
- `src/lessons.ts`: independent interactive teaching examples and full-sentence explanations.
- `src/lesson-animation.ts`: play, pause, step, reset and reduced-motion behavior for teaching animations.
- `tests/engine.test.ts`: graph and game rule checks.

Every legal move has equal cost. BFS processes all nodes at distance k before distance k+1, so the first goal reached has the fewest transformations. This small implementation scans the vocabulary to find neighbors: O(V²L) search work, where L is word length. Search snapshots add O(V²) storage in the worst case. Larger dictionaries should use wildcard neighbor indexing and incremental snapshots.

## Interaction feedback

Invalid moves are checked while typing, with a red field and explanation. Submission adds a notification and a brief shake. Valid moves animate into the ladder. Winning displays a persistent celebration card, move count versus the shortest route, confetti, and a next-challenge button. Undo and restart clear celebration state. Active player, solution and BFS frontier edges use marching dashes; current nodes pulse and the graph follows your progress. The operating system's reduced-motion preference removes confetti, dashes in motion, pulses and UI motion while retaining all text feedback.

Browser regression tests:

```sh
npx playwright install chromium
npm run test:e2e
```

Every explainer slide includes a replayable visual walkthrough and an interactive prediction. Visitors can play, pause, reset, or step through edge creation, FIFO queue traversal, backward parent tracing followed by route reversal, and wildcard bucket lookup followed by candidate deduplication. Explanatory headings, captions, feedback and paragraphs use complete sentences. Changing slides or hiding the page pauses teaching animations. Reduced-motion visitors can step manually or show the final state without animated transitions.
