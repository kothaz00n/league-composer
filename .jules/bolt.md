## 2024-04-30 - [Pre-calculating Sets outside loops in recommendation engine]
**Learning:** In hot paths (like in `src/engine/recommend.js` and `getCompositionAnalysis`), using `Object.values().includes()` or similar array conversions within a nested loop causes O(N^2) complexity degradation and unnecessary memory allocations.
**Action:** Always pre-calculate a `Set` outside of nested loops for membership checks to improve performance from O(N) array scans to O(1) checks.
