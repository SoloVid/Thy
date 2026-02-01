#!/usr/env node

import { join } from "node:path"
import { rootDir } from "@/root-dir.ts"
import { runNodeCli } from "../utils/run-node-cli.ts"
import { buildSite } from "./build-website.ts"
import { serveFiles } from "./serve-files.ts"

runNodeCli(async () => {
  console.info("Building...")
  await buildSite()
  serveFiles(join(rootDir, "out/website"), 8089)
})
