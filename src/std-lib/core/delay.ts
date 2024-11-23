export async function delayBuiltin(ms: number): Promise<undefined> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
