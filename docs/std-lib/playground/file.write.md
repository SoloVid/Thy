```thy
name is given String
contents is given String
await
type return Void
```

Asynchronously write contents to a file.

"File" in this context refers to a Thy-Playground-managed file
stored in [local storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
These are the same files are accessible via the Thy Playground UI.

**Example:**

```thy
file.write "my-file.txt" """
  Some file contents.

  I guess you're familiar with that...
await that
```
