## 2024-06-11 - [Optimize Set Lookups in Hot Loops]
**Learning:** Checking for elements in an array created via `Object.values()` inside a nested loop causes O(N^2) complexity degradation and unnecessary memory allocation and garbage collection.
**Action:** Pre-calculate `Set`s outside of nested loops for membership checks (e.g. using `Set.prototype.has()`) to improve performance from O(N) to O(1) inside hot paths.
