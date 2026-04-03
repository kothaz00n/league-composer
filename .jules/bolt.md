## 2025-01-28 - [O(1) property lookup vs Object.keys().find()]
**Learning:** In hot loops like the win rate lookup during draft analysis, falling back immediately to `Object.keys(obj).find(k => k.toLowerCase() === val.toLowerCase())` is extremely expensive due to the O(N) array allocation and iteration.
**Action:** Always attempt a fast `O(1)` direct property access (e.g. `obj[val] || obj[val.toLowerCase()]`) before using `Object.keys().find()` as a fallback for case-insensitive lookups.
