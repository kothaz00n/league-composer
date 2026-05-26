## 2024-05-26 - [Set optimization for membership checks in nested loops]
**Learning:** Pre-calculating a `Set` outside of nested loops (such as `Object.values(teamRoles).includes()`) prevents redundant array allocations and O(N*M) complexity degradation, especially in hot paths like `getCompositionAnalysis` in `src/engine/recommend.js`.
**Action:** When performing membership checks within loops, especially nested ones, always use `new Set(iterable)` outside the loop and `.has(value)` inside it to avoid creating new arrays per iteration and degrading performance to O(N^2).
