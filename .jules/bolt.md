## 2024-05-30 - [Engine Recommendation Optimization]
**Learning:** The nested loop logic within `getRecommendations` in `src/engine/recommend.js` calculates `deriveRolesFromPool` repeatedly during the scoring iteration. This function iterated over a custom team pool and extracted required and bonus roles for every single champion iteration, leading to significant O(N*M) degradation.
**Action:** Memoized the custom pool values and derived roles before the main `allChampions` loop to ensure expensive conversions only happen once per draft recommendation request. Lookups are now O(1).
