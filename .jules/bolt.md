## 2024-05-18 - [Optimize Object Spreading in Hot Paths]
**Learning:** Found that using the spread operator (`{ ...static, ...dynamic }`) inside hot loop evaluations for champion recommendations dynamically creates a massive number of garbage collector (GC) objects overhead without any real benefit when fallback logic logic can be used instead.
**Action:** Replaced object spreading inside loops with direct property lookups (like `dynamicCounters[enemyName] ?? champData.counters?.[enemyName]`). Ensure hot paths prioritize simple variable lookups over new object creation.
