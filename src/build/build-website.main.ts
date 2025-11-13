#!/usr/env node

import { runNodeCli } from "../utils/run-node-cli"
import { buildSite } from "./build-website"

runNodeCli(async () => {
  await buildSite()
})
