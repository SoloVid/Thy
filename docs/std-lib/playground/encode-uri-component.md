`encodeURIComponent` replaces certain special characters in a string
for encoded equivalents safe for URLs.
It is the same [`encodeURIComponent` function provided by JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent).

**Example:**

```thy
targetUrl is encodeURIComponent "https://thy.dev"
corsSafeUrl is def "https://corsproxy.io/?.targetUrl."
fetch corsSafeUrl
await that
that.text
await that
print that
```
