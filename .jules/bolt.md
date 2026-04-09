## 2025-05-19 - Loop Invariants in Recommendation Engine
**Learning:** In the recommendation engine's hot path (`getRecommendations`), calculations like mapping champion pools or finding ally roles were being repeated for every champion. Memoizing these custom archetype and flex mode operations outside the `O(N)` loop prevents unnecessary overhead.
**Action:** Always check if operations dependent solely on `targetArchetypeDef` or `allies` can be extracted out of the core champion evaluation loop to maintain `O(N)` performance instead of `O(N*M)`.
