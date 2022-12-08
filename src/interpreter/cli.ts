#!/usr/env node

import { readFile } from "node:fs/promises"
import { core } from "../std-lib"
import { interpretThyBlock } from "./block"

const sourceFile = process.argv[2]

async function run() {
  try {
    const source = await readFile(sourceFile, "utf-8")
    const interpreted = interpretThyBlock(source)
    interpreted(core)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

run()
