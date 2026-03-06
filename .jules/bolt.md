## 2024-10-25 - [Batch IPC Calls for Renderer State Serialization]
**Learning:** Sending hundreds of individual IPC calls from the React frontend to the Electron main process via `Promise.all` causes significant serialization overhead and blocks the main thread, leading to UI stuttering and unresponsiveness.
**Action:** When a React component needs to load large amounts of data asynchronously from the main process (e.g., retrieving stats for 100+ champions in `WinRateBrowser`), always implement a bulk IPC channel (`CHAMPION_GET_MULTIPLE_STATS`) and batch requests (e.g. batch size of 100).
