
// TODO: Test this.
export async function saferPromiseAll<T>(values: readonly PromiseLike<T>[]): Promise<T[]> {
  const results = await Promise.allSettled(values)
  return results.map((p) => {
    if (p.status === "rejected") {
      throw p.reason
    }
    return p.value
  })
}