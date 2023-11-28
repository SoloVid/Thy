```thy
await
type ReturnType is Array String
type return ReturnType
```

Asynchronously return full list of Thy Playground files.

"File" in this context refers to a Thy-Playground-managed file
stored in [local storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
These are the same files are accessible via the Thy Playground UI.

**Example:**

```thy
file.list
await that
json.encode that
print that
```
