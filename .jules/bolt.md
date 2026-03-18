## 2024-03-18 - Memoize loop-invariant computations in recommendation engine
**Learning:** The `getRecommendations` scoring loop evaluated derived custom archetypes, champion pools, and flex mode ally targets inside the N-champion iteration.
**Action:** Move loop-invariant computations before the `for` loop to prevent O(N) redundant calculations of the same arrays. Ensure `null` checks correctly bypass memoized values if the context is absent.
