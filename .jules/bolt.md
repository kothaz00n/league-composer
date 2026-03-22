## 2024-05-24 - [IPC Overhead]
**Learning:** High number of sequential IPC calls to `getChampionStats` blocks the Electron context bridge, leading to sluggish rendering, particularly during initialization or view transitions on lists with >150 items.
**Action:** Implemented `CHAMPION_GET_MULTIPLE_STATS` to batch requests and reduced the number of IPC invocations by scaling the frontend batch chunk size to 100. Always consider bulk IPC data fetching when iterating over the roster in Electron.
