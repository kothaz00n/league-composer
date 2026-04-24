## 2024-04-24 - [Memoizing Loop-Invariant Operations]
**Learning:** O(N*P) complexity degradation can occur in hot loops, such as the `getRecommendations` engine when repeatedly deriving custom roles or finding array elements (e.g. `allies.find()`) inside the champion iteration loop.
**Action:** Always pre-calculate and memoize loop-invariant operations like `deriveRolesFromPool` outside the main loop and transform arrays to `Map`s or Objects for fast O(1) lookups to avoid redundant computations inside iterations.
