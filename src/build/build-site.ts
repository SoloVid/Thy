#!/usr/env node

import { runNodeCli } from "../utils/run-node-cli"
import { compileTs } from "./compile-ts"
import { generateHtml } from "./generate-html"

runNodeCli(async () => {
  await Promise.all([
    generateHtml(),
    compileTs(),
  ])
})
