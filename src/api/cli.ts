#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { compile } from './compile';
import chalk from 'chalk';

const argv = yargs(process.argv.slice(2)).options({
  target: { alias: 't', choices: ["ts-namespace"] as const, demandOption: true, description: "Target format of compiled output" },
  rootDir: { alias: 'r', type: 'string', default: '.', description: "Root directory containing Thy source files" },
  outDir: { alias: 'o', type: 'string', default: '.', description: "Output directory for compiled output files" },
}).argv;

let failure = false

async function run() {
    const args = await argv
    const results = await compile(args)
    let errorCount = 0
    for (const f of results.files) {
        for (const e of f.errors) {
            failure = true
            errorCount++
            // console.error(e)
            console.error(`${chalk.cyan(f.filePath)}:${chalk.yellow(e.start.line + 1)}:${chalk.yellow(e.start.column + 1)} - ${chalk.red("error")} ${chalk.gray("THY1234")}: ${e.message}`)
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
    process.exit(failure ? 1 : 0)
}, (e) => {
    console.error(e)
    process.exit(1)
})
