## 2024-05-24 - [Avoid O(N*M) Object.values in Loops]
**Learning:** Calling `Object.values(teamRoles).includes(candidateName)` inside nested loops in `getCompositionAnalysis` causes repeated O(N) object value allocations and array lookups, creating significant overhead in analytical functions.
**Action:** Always pre-calculate sets like `const teamValues = new Set(Object.values(teamRoles))` outside loops to perform O(1) membership checks, converting O(N*M) operations to O(N+M).
