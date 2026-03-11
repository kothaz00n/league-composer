## 2024-05-15 - [Recommend Engine Object Operations in Loop]
**Learning:** Found an O(N*P) loop performance degradation in `src/engine/recommend.js` `getRecommendations`. Inside a massive `for` loop over 160+ champions, the code was repeatedly calling `.map()` and re-deriving roles for custom archetypes (`deriveRolesFromPool`).
**Action:** Always hoist invariant object allocations (`.map`, `Object.keys`, complex function calls) outside of iteration loops, especially in core game logic loops.
