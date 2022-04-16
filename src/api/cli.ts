#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { compile } from './compile';

const argv = yargs(process.argv.slice(2)).options({
  target: { alias: 't', choices: ["ts-namespace"] as const, demandOption: true, description: "Target format of compiled output" },
  rootDir: { alias: 'r', type: 'string', default: '.', description: "Root directory containing Thy source files" },
  outDir: { alias: 'o', type: 'string', default: '.', description: "Output directory for compiled output files" },
}).argv;

async function run() {
    const args = await argv
    const results = await compile(args)
    let errorCount = 0
    for (const f of results.files) {
        for (const e of f.errors) {
            errorCount++
            // console.error(e)
            console.error(`${f.filePath}:${e.start.line + 1}:${e.start.column + 1} - error THY1234: ${e.message}`)
            console.error()
            console.error(e.contextualizedErrorMessage)
            console.error()
        }
    }
    console.error()
    console.error(`Found ${errorCount} ${errorCount > 0 ? "errors" : "error"}.`)
    console.error()
}

run().then(() => {
    // Do nothing.
}, (e) => {
    console.error(e)
})
