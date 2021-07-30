import { parseForCst } from "./parse-for-cst"
import { readProgram } from "./read-program"

async function run() {
    try {
        const source = await readProgram("example-program.thy")
        const cst = parseForCst(source)
        console.log(cst)
    } catch (e: unknown) {
        console.error(e)
    }
}

run()