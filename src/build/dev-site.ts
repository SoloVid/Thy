#!/usr/env node

import chokidar from "chokidar"
import { join } from "node:path"
import { runNodeCli } from "../utils/run-node-cli"
import { compileTs } from "./compile-ts"
import { generateHtml } from "./generate-html"
import { pageOutputDir } from "./page-file-paths"
import { serveFiles } from "./serve-files"

runNodeCli(async () => {
  runBuild()

  chokidar
  .watch(join(__dirname, ".."), {
    ignoreInitial: true,
  })
  .on("all", (event, path) => {
    // This timeout gives the parent process a moment to shut us down before double printing.
    setTimeout(() => {
      console.info(`Change detected: ${path}`)
      runBuild()
    }, 10)
  })

  serveFiles(pageOutputDir, 8089)
})

function runBuild() {
  Promise.all([
    generateHtml(),
    compileTs(),
  ]).then(() => {
    console.info("Build complete")
  }, (e) => {
    console.error(e)
  })
}
