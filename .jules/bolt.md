## 2024-05-19 - [Memoize loop-invariant operations in getRecommendations hot loop]
**Learning:** In the `getRecommendations` hot loop (iterating ~160+ champions), recomputing loop-invariant values like `deriveRolesFromPool`, mapping arrays to sets, and object lookups for Flex mode caused significant overhead (an N*M complexity degradation).
**Action:** Always pre-calculate Sets and object derivatives outside of nested loops for membership checks instead of using array conversions or function calls within the loop.
