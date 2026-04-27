## 2024-05-24 - Optimize getRecommendations hot loop allocations
**Learning:** Object spreading (`{ ...static, ...dynamic }`) and performing O(N) operations (`allies.find()`) inside a hot loop traversing 160+ champions introduces significant memory allocation and garbage collection overhead.
**Action:** Always pre-calculate maps (`roleToAlly`) and array filters (`derivedRoles`, `otherRoles`) outside the main iteration. Use direct property lookups (`dynamicCounters[name] ?? staticCounters[name]`) instead of creating intermediate merged objects per iteration.
