#!/usr/env node

import { runNodeCli } from "../utils/run-node-cli.ts"
import { buildSite } from "./build-website.ts"

runNodeCli(async () => {
  await buildSite()
})
