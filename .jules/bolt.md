
## 2024-05-24 - [Avoid Object Spread in Hot Loops]
**Learning:** In V8/Node.js, using the object spread operator (`{ ...objA, ...objB }`) inside a tight loop that runs for every iteration (e.g., evaluating every champion against every enemy) creates a massive amount of garbage collection pressure and significant overhead from `ObjectKeys` and `ObjectEntries` built-ins.
**Action:** Replace object spread with direct property lookups (`objA[key] || objB[key]`) with a fallback when iterating over dictionaries in a hot path to significantly improve performance.
