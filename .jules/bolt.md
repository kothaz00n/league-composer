## 2026-04-13 - Optimize substitution analysis array allocations
**Learning:** In nested loops over large datasets (like all champions), repeatedly calling `Object.values()` and `.includes()` creates O(N) array allocations and O(N) lookups inside the inner loop, severely degrading performance.
**Action:** Always pre-calculate a `Set` outside the loop to achieve O(1) lookups and avoid redundant object-to-array conversions.
