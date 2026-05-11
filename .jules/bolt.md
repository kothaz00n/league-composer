
## 2024-05-24 - [Avoid Object Spreading in Hot Loops]
**Learning:** Using object spread syntax (`{ ...static, ...dynamic }`) inside hot loops—like the `getRecommendations` engine which processes O(N*P) iterations per request—causes severe performance degradation due to continuous memory allocation and garbage collection overhead.
**Action:** Always favor direct property lookups (`(dynamic && dynamic[key]) || (static && static[key])`) with fallbacks over merging objects on every iteration inside performance-critical paths.
