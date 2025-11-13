#!/usr/env node

import { join } from "node:path"
import { rootDir } from "root-dir"
import { runNodeCli } from "../utils/run-node-cli"
import { buildSite } from "./build-website"
import { serveFiles } from "./serve-files"

runNodeCli(async () => {
  console.info("Building...")
  await buildSite()
  serveFiles(join(rootDir, "out/website"), 8089)
})
