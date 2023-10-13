
export function runNodeCli(logic: () => PromiseLike<void>) {
  logic().then(() => {
    // Do nothing.
  }, (e) => {
    console.error(e)
    process.exit(1)
  })
}
