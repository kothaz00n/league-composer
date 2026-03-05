
## 2025-02-17 - Optimize object key lookup vs Object.keys().find() overhead
**Learning:** `Object.keys(obj).find(k => k.toLowerCase() === role.toLowerCase())` is extremely expensive when called repeatedly in loops (like drafting analysis or fetching batched win rates). It forces array allocation on every call and iterated O(N) evaluation.
**Action:** Always attempt O(1) direct property access first `obj[key.toLowerCase()]` as the fast-path before falling back to array enumeration.
