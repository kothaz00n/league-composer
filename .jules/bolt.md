
## 2025-03-09 - Memoize loop invariants in recommendation engine
**Learning:** In highly iterated loops like `getRecommendations`, O(N*P) nested loops such as repeatedly mapping arrays or resolving `allies.find()` degrade performance when scaling up the number of champions.
**Action:** Always extract static mapping, filtering, and `.find()` operations that depend on external state (like custom archetypes or flex roster configurations) outside of the main champion `for` loop to compute them once.
