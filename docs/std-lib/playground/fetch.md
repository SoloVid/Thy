`fetch` is a function to make HTTP requests.
It is the same [`fetch` function provided by JavaScript](https://developer.mozilla.org/en-US/docs/Web/API/fetch).

> Note: In the playground, you'll run into [CORS errors](https://stackoverflow.com/a/35553666/4639640)
> for most URLs you may try to hit.
> You may find a service like [corsproxy.io](https://corsproxy.io) useful in that scenario.


**Example:**

```thy
fetch "https://thy.dev"
await that
that.text
await that
print that

Use a CORS proxy instead of directly requesting.
fetch "https://corsproxy.io/?https%3A%2F%2Fthy.dev"
await that
that.text
await that
print that
```
