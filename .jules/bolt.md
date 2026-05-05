## 2024-05-05 - [Hoisting invariant variables to improve getRecommendations loops]
**Learning:** In getRecommendations, operations like building derived roles, filtering objects by keys and converting string lookups using arrays with include happen for each iteration of all champions.
**Action:** By pulling targetArchetypeDef array to a Set before loops, using object loop for roster roles over mapping, we can shave down execution time.
