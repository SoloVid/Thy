import esbuild from "esbuild"
import { join } from "node:path"
import { getPageInputs, pageInputDir, pageOutputDir } from "./page-file-paths"

export async function compileTs() {
  const pageInputs = await getPageInputs()
  await esbuild.build({
    logLevel: "info",
    entryPoints: pageInputs.map(f => join(pageInputDir, f)),
    loader: {
      ".md": "text",
    },
    bundle: true,
    platform: "browser",
    jsx: "automatic",
    outdir: pageOutputDir,
    outbase: pageInputDir,
    sourcemap: true,
    minify: true,
  })
}
