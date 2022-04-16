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
    await compile(args)
}

run().then(() => {
    // Do nothing.
}, (e) => {
    console.error(e)
})
