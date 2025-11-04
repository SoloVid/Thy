#!/usr/env node

import chokidar from "chokidar"
import { generateHtmlFiles } from "../home/prebuild/main"
import { join } from "node:path"
import { runNodeCli } from "../utils/run-node-cli"
import { compileTs } from "./compile-ts"
import { pageOutputDir } from "./page-file-paths"
import { serveFiles } from "./serve-files"

runNodeCli(async () => {
  console.info("Building...")
  await runBuild()

  chokidar
    .watch([join(__dirname, ".."), join(__dirname, "../../docs")], {
      ignoreInitial: true,
    })
    .on("all", (event, path) => {
      // This timeout gives the parent process a moment to shut us down before double printing.
      setTimeout(() => {
        console.info(`Change detected: ${path}`)
        runBuild().then(
          () => {
            console.info("Rebuild complete!")
          },
          (e) => {
            console.error(e)
          },
        )
      }, 10)
    })

  serveFiles(pageOutputDir, 8089)
})

function runBuild() {
  return Promise.all([generateHtmlFiles(), compileTs()])
}
