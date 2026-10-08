# Engineering Lessons Implementation Plan

**Goal:** Teach an engineer to model, represent, and solve the word-ladder game through twelve slides in three chapters.

**Architecture:** Separate authored lesson content, pure teaching traces, visual rendering, and chapter navigation. Teaching state stays independent of gameplay and the connection map. Use the existing automatic animation controller with explicit disposal when slides change.

**Tech Stack:** TypeScript, native DOM, SVG, Vite and Playwright.

**Spec:** The approved twelve-slide sequence in the project conversation on 2026-10-08.

## Global Constraints

- Keep gameplay and the connection map above the optional lesson.
- Provide twelve slides in three chapters: conceptualization, data structures, algorithms.
- Keep essential explanations visible without requiring a correct answer.
- Every slide includes an animation or interactive component and full-sentence explanatory prose.
- Play animations when visible, replay on selection, and remove playback buttons.
- Show completed visuals under reduced motion.
- Explain actual scanning implementation separately from proposed indexing.

## Review Focus

- Rapid chapter changes must dispose old timers and observers.
- Small screens must keep code and diagrams within the page width.
- Incorrect predictions must explain the misconception and allow another attempt.
- Discovery must occur before enqueueing so cycles do not duplicate frontier entries.
- Lesson exploration must never reveal or mutate gameplay without explicit comparison.

## Tasks

- [x] Add pure BFS operation traces and DFS counterexample tests that assert queue, discovered set, parent map, distance and route consistency.
- [x] Author twelve lessons with visible explanations, decision rationale and misconception feedback.
- [x] Render live character comparisons, graph representations, frontier structures, wildcard buckets, DFS/BFS comparison, synchronized pseudocode and route reconstruction.
- [x] Replace four tabs with accessible chapter tabs, slide buttons and previous/next lesson navigation. Persist prediction progress for the page session.
- [x] Add animation disposal and reduced-motion final-state checks.
- [x] Replace obsolete lesson tests with twelve-slide navigation, interaction, autoplay, isolation and mobile regression coverage.
- [x] Run unit tests, TypeScript/build and browser checks; inspect desktop/mobile screenshots; review and create a new PR from main.
