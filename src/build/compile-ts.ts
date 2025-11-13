import esbuild from "esbuild"
import { join } from "node:path"
import { rootDir } from "root-dir"

async function compile(from: string, to: string) {
  await esbuild.build({
    logLevel: "info",
    entryPoints: [
      join(rootDir, from)
    ],
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
  await compile("src/editor/index.tsx", "public/play/index.js")
  await compile("src/home/static-page-scripting.ts", "public/static-page-scripting.js")
}
