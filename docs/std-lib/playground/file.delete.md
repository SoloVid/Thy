```thy
name is given String
await
type return Void
```

Asynchronously delete a file.

"File" in this context refers to a Thy-Playground-managed file
stored in [local storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
These are the same files are accessible via the Thy Playground UI.

**Example:**

```thy
file.delete "my-file.txt"
await that
```
