```thy
name is given String
await
type return Boolean
```

Asynchronously return whether the file exists.

"File" in this context refers to a Thy-Playground-managed file
stored in [local storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
These are the same files are accessible via the Thy Playground UI.

**Example:**

```thy
file.exists "my-file.txt"
await that
if that
  print "It exists!"
and else
  print ":( not found"
```
