## 2024-05-24 - V8 Object Spread Overhead in Hot Loops
**Learning:** In the core recommendation engine (`src/engine/recommend.js`), an object spread operation (`{ ...static, ...dynamic }`) inside a loop over all 160+ champions took ~25x more time than the rest of the logic combined. This codebase evaluates thousands of configurations in real-time. Creating a new object on every iteration caused immense GC pressure and micro-allocations.
**Action:** Replace object spreads inside any `for (const champ of allChamps)` loop with direct property access/fallbacks (`dynamic[key] !== undefined ? dynamic[key] : static[key]`).

## 2024-05-24 - O(N) Array Lookups in Hot Paths
**Learning:** `Object.values(allChamps)` and `allies.find()` within nested loops caused massive O(N^2) complexity degradation during substitution analysis. V8 cannot optimize these away.
**Action:** Always pre-calculate `Sets` and `Dictionaries` (e.g. `roleToAlly` map) *outside* the hot loops for O(1) membership and property checks.
