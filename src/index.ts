import { tsGenerator } from "./code-gen/ts/generate-ts"
import { standardLibraryCore } from "./code-gen/ts/standard-library/core"
import { parse } from "./parser/parser"
import { readProgram } from "./read-program"
import { makeTokenizer } from "./tokenizer/tokenizer"

async function run() {
    try {
        const source = await readProgram("example-program.thy")
        const tokenizer = makeTokenizer(source, [])

        // let token = tokenizer.getNextToken()
        // while (token !== null) {
        //     console.log(`${token.line}:${token.type}:${JSON.stringify(token.text)}`)
        //     // console.log(token)
        //     token = tokenizer.getNextToken()
        // }

        const parserOutput = parse(tokenizer)
        for (const err of parserOutput.errors) {
            console.error(err)
        }
        const tree = parserOutput.top
        console.log(tree)

        console.log(tsGenerator(standardLibraryCore)(tree))
    } catch (e: unknown) {
        console.error(e)
    }
}

run()
