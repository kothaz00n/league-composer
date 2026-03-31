## 2024-05-24 - Initializing Bolt Journal
**Learning:** Initialized Bolt journal.
**Action:** Ready to record critical codebase-specific performance learnings.## 2024-05-24 - Recommendation Engine Loop Optimization
**Learning:** Found O(N*P) complexity degradation inside the `getRecommendations` scoring loop due to `deriveRolesFromPool`, `.map()` on champion pools, and `allies.find()` for flex synergy being called for every single champion (N ~ 160).
**Action:** Always check hot loops for loop-invariant calculations that allocate arrays or perform linear searches. Hoist them to the function scope to memoize results and prevent unnecessary GC pressure and CPU cycles.
