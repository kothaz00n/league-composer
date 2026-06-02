
## 2024-05-18 - [Hot Loop Allocation Mitigation]
**Learning:** In highly iterated functions like `getRecommendations` (called on every draft update and traversing ~160 champions), using object spreading (`{ ...static, ...dynamic }`) to merge data creates excessive object allocations per iteration. This leads to heavy garbage collection pressure and noticeably slower execution times in Electron's Node environment.
**Action:** Replace object spread merging with direct property lookups (`let val = dynamic[key]; if (val === undefined) val = static[key];`) inside hot loops to maintain fallback logic without the memory allocation penalty.
