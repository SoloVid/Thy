import { join } from "node:path"

export const testFileDir = join(__dirname, "../test/node-runtime")

export const testFileA = join(testFileDir, "a.thy")
export const testFileB = join(testFileDir, "b.thy")
export const testFileBaz = join(testFileDir, "my/baz.thy")
export const testFileBar = join(testFileDir, "my/foo/bar.thy")
