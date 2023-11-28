```thy
name is given String
await
type return String
```

Asynchronously return contents of a file
or throw an exception if not found.

"File" in this context refers to a Thy-Playground-managed file
stored in [local storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
These are the same files are accessible via the Thy Playground UI.

**Example:**

```thy
file.read "my-file.txt"
await that
print that
```
