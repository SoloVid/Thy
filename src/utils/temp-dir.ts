import { withDir } from "tmp-promise"

export function withTempDir<T>(exercise: (dir: string) => PromiseLike<T>): PromiseLike<T> {
  return withDir(async (o) => {
    return exercise(o.path)
  }, {
    unsafeCleanup: true,
  })
}
