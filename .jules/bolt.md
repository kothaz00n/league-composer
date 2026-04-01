## 2024-05-19 - Centralized Champion Tags Map
**Learning:** The application frequently creates a `tagsMap` (champion name → tags array) by iterating over all champions in `src/main/main.js` and other places. This is a redundant O(N) operation per IPC request or initialization.
**Action:** Expose `getChampionTagsMap()` from `src/data/champions.js` to return the already cached `championTagsMap` directly, saving unnecessary iterations and object creations.
