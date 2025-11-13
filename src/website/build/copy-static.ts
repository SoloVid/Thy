import { cp, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { rootDir } from "root-dir";
import { walkFiles } from "utils/walk-files";

export async function copyStaticFiles() {
  const inputDir = join(rootDir, "src/website/static")
  const outputDir = join(rootDir, "out/website")
  await walkFiles({
    rootDir: inputDir
  }, async (file) => {
    const outputPath = join(outputDir, file)
    await mkdir(dirname(outputPath), { recursive: true })
    await cp(join(inputDir, file), outputPath)
  })
}
