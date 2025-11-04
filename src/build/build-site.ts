#!/usr/env node

import { generateHtmlFiles } from "../home/prebuild/main"
import { runNodeCli } from "../utils/run-node-cli"
import { compileTs } from "./compile-ts"

runNodeCli(async () => {
  await Promise.all([generateHtmlFiles(), compileTs()])
})
