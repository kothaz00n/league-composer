## 2024-03-28 - [Memory Allocation inside Hot Loop]
**Learning:** Object spreading (`{ ...static, ...dynamic }`) inside the `getRecommendations` hot loop creates a new object on every iteration for every champion, leading to excessive memory allocations and potential garbage collection (GC) pressure.
**Action:** Replace object spreading with direct property lookups (`dynamicCounters[enemyName] || staticCounters[enemyName]`) to avoid unnecessary memory allocations and GC overhead.
