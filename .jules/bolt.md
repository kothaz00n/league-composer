## 2024-05-13 - Avoid Object.values().includes() in hot nested loops
**Learning:** Checking membership of an object's values by converting it to an array in an inner loop (`Object.values(obj).includes(item)`) degrades performance to O(N^2) or worse because it allocates a new array and traverses it linearly on every single iteration of the outer loop.
**Action:** Always pre-calculate a `Set` from the object values (`new Set(Object.values(obj))`) outside the nested loop to convert the inner membership check to an O(1) `.has()` lookup.
