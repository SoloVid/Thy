import esbuild from "esbuild"
import { join } from "node:path"
import { rootDir } from "@/root-dir.ts"

async function compile(from: string, to: string) {
  await esbuild.build({
    logLevel: "info",
    entryPoints: [join(rootDir, from)],
    alias: {
      react: "preact/compat",
      "react-dom": "preact/compat",
    },
    bundle: true,
    platform: "browser",
    target: "es2021",
    jsx: "automatic",
    outfile: join(rootDir, to),
    sourcemap: true,
    minify: true,
  })
}

export async function compileTs() {
  await compile("src/editor/index.tsx", "out/website/play/index.js")
  await compile(
    "src/website/static-page-scripting.ts",
    "out/website/static-page-scripting.js",
  )
}
