## 2024-03-08 - Optimize Champion Stats Batch Retrieval
**Learning:** Calling `ipcRenderer.invoke` individually for hundreds of champions (even in batches) introduces significant IPC serialization and context-crossing overhead, blocking the renderer and adding unnecessary IPC traffic.
**Action:** Always batch related data retrieval into a single or chunked IPC call (e.g., `CHAMPION_GET_MULTIPLE_STATS`) using a reasonable chunk size (like 100 items) to drastically reduce IPC overhead and improve renderer responsivness when dealing with large datasets.
