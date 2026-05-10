## 2024-05-15 - [Object Spread in Hot Loops]
**Learning:** Object spread syntax (`{ ...a, ...b }`) inside a tight hot loop (like iterating through all 160+ champions for scoring) causes massive object allocations and GC overhead in Node.js/V8, noticeably increasing calculation time in this codebase's architecture.
**Action:** Always prefer direct property lookups (`a.key ?? b.key`) with fallbacks over merging objects within the hot path for static data like counters and synergies.
