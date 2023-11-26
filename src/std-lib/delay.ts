export async function delayBuiltin(ms: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
