## 2026-04-21 - Optimize composition analysis substitution suggestions loop
**Learning:** Found an O(N*M) array allocation inside a hot loop in `getCompositionAnalysis` where `Object.values(teamRoles).includes(candidateName)` was being called for each potential substitute candidate.
**Action:** Pre-calculate `new Set(Object.values(teamRoles))` outside the candidate loop to change the lookup from O(N) array scan to O(1) Set lookup, preventing unnecessary garbage collection.
