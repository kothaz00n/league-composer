## 2024-05-23 - [Optimization in Scoring Loop]
**Learning:** O(N*M) complexity degradation in the `getRecommendations` hot loop is caused by object spreading (`{ ...static, ...dynamic }`) and recalculating loop-invariant data (like `deriveRolesFromPool` and empty ally favorites) per champion.
**Action:** Always pre-calculate invariant data outside the main scoring loop and use direct property lookups instead of object spreading to prevent redundant memory allocations and garbage collection overhead.
