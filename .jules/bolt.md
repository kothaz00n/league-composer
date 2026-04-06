## 2025-02-28 - Optimizing the Recommendation Engine Hot Loop
**Learning:** Object spreading (`{ ...static, ...dynamic }`) and redundant array/set operations inside a hot loop (like O(N) iteration over all champions in `getRecommendations`) causes severe performance degradation due to unnecessary memory allocations and garbage collection overhead.
**Action:** Pre-compute loop-invariant data outside of hot loops (e.g., caching derived roles, champion pools, and empty flex roles) and replace object spreading with direct property lookups and fallbacks inside the loop.
