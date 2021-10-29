import { generateTs } from "./code-gen/generate-ts"
import { parseForCst } from "./parse-for-cst"
import { parse } from "./parser/parser"
import { readProgram } from "./read-program"
import { makeTokenizer } from "./tokenizer/tokenizer"

async function run() {
    try {
        const source = await readProgram("example-program.thy")
        const tokenizer = makeTokenizer(source)

        // let token = tokenizer.getNextToken()
        // while (token !== null) {
        //     console.log(`${token.line}:${token.type}:${JSON.stringify(token.text)}`)
        //     // console.log(token)
        //     token = tokenizer.getNextToken()
        // }

        const tree = parse(tokenizer)
        console.log(tree)

        console.log(generateTs(tree))

        // const cst = await parseForCst(source)
        // console.log(cst)
    } catch (e: unknown) {
        console.error(e)
    }
}

run()

// function fun<T>() {
//     return 5 as any as T
// }

// const fun3 = fun;
// fun3<null>();

// const fun2 = () => fun<boolean>()
// type FAB = ReturnType<typeof fun2>

// // class FF<T> { w(e: T) { return fun<T>() } }
// // type FFF<T> = ReturnType<FF<T>['w']>
// // type FA = FFF<boolean>

// type F = ReturnType<typeof fun<1>>
// type AF = F<null>
// type A0 = typeof (fun<boolean>())

// // type A = typeof fun<boolean>()
// type A<T> = ReturnType<typeof fun>
