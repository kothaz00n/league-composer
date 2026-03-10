# Bolt's Journal

## Critical Learnings


## 2025-02-14 - Memoize O(N) Array Operations in Recommendation Loop
**Learning:** In `src/engine/recommend.js`, the scoring loop iterates over ~165 champions. Calling functions like `deriveRolesFromPool` (which itself iterates over a custom champion pool) inside this loop creates an O(C * P) complexity (where C is the number of champions and P is the pool size). This caused significant slowdowns when custom archetypes were selected during draft analysis.
**Action:** Always inspect the main scoring loop in recommendation/filtering engines. Any data derivation that depends solely on external parameters (like user input or draft state) and not on the current iterated champion MUST be memoized or computed once before the loop begins.
