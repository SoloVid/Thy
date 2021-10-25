import { createTokenInstance, CstNode, Lexer } from "chevrotain"
import { Parser } from "./parser"
import { TokenTypes } from "./tokenizer/token-types.chevrotain"

export async function parseForCst(source: string): Promise<CstNode> {
    const tokenTypes = new TokenTypes()
    const lexer = new Lexer(tokenTypes.allTokens)
    const lexingResult = lexer.tokenize(source)
    const tokens = lexingResult.tokens
    const [indentCount, outdentCount] = tokens.reduce((total, token) => {
        if (token.tokenType === tokenTypes.StartBlock) {
            return [total[0] + 1, total[1]]
        }
        if (token.tokenType === tokenTypes.EndBlock) {
            return [total[0], total[1] + 1]
        }
        return total
    }, [0, 0])

    if (outdentCount > indentCount) {
        throw new Error('How are there more outdents than indents?')
    }

    // Add trailing outdents
    for (let i = outdentCount; i < indentCount; i++) {
        tokens.push(createTokenInstance(tokenTypes.EndBlock, "", NaN, NaN, NaN, NaN, NaN, NaN))
    }

    tokens.map(t => {
        return {
            image: t.image,
            tokenType: t.tokenType.name
        }
    }).forEach(e => console.log(e))
    console.error(lexingResult.errors)

    const parser = new Parser(tokenTypes)
    parser.input = tokens
    return parser.script()
}
