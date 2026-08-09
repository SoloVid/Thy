import { rootDir } from "@/root-dir.ts"
import { findAllTestFiles } from "@/test/utils/find-all-test-files.ts"
import { writeFile } from "node:fs/promises"
import { join } from "node:path"

const files = await findAllTestFiles()
await writeFile(
  join(rootDir, "src", "all-tests.x.ts"),
  files.map((f) => `import "./${f}"\n`).join(""),
)
