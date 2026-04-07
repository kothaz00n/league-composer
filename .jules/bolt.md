## 2026-04-07 - [Memoize loop invariants in getRecommendations]
**Learning:** Recalculating loop invariants like `deriveRolesFromPool`, mapping over nested arrays, and filtering data inside a hot loop (like the O(N) iteration over ~160 champions in `getRecommendations`) causes an O(N*P) complexity degradation where P is the pool size.
**Action:** Always identify operations that don't depend on the iterator variable in hot loops and hoist/memoize them before the loop to prevent performance regression in the core engine logic.
