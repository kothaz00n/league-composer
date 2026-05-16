
## 2024-05-18 - [Hot Path Optimization: Avoid O(N^2) with `Object.values().includes()`]
**Learning:** In highly nested loops, such as the substitution analysis in `getCompositionAnalysis` (`src/engine/recommend.js`), using `Object.values(teamRoles).includes(candidateName)` inside the innermost loop dynamically recalculates the values array and performs an O(N) lookup repeatedly, turning O(N*M) iterations into effectively O(N*M*K). This drastically slows down processing in hot paths.
**Action:** Always extract invariant data conversions (like pulling values from an object into a `Set`) *outside* of hot loops. A pre-calculated `Set` reduces lookup times to O(1) and eliminates redundant array allocations.
