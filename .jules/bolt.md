## 2024-05-18 - [Batched IPC Calls]
**Learning:** Iteratively calling ipcRenderer.invoke causes massive performance overhead.
**Action:** Batch IPC calls in the main process to reduce overhead. When dealing with arrays in IPC, ensure the main process resolves inner promises so serialization works correctly.
