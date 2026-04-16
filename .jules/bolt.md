## 2024-06-19 - [Hoisting O(N) conversions out of hot paths]
**Learning:** In `getCompositionAnalysis`, converting object values into an array using `Object.values(teamRoles)` inside a nested loop with `includes()` resulted in redundant array allocations and O(N) lookups, causing O(N^2) complexity degradation when iterating over champion candidates.
**Action:** Always pre-calculate Sets outside of nested loops for membership checks (`const teamMembersSet = new Set(Object.values(teamRoles))`) to avoid intermediate allocations and reduce lookup time to O(1).
