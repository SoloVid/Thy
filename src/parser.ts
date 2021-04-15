import { createToken, createTokenInstance, Lexer, CstParser, IToken } from "chevrotain"
import { allTokens } from "./lexer"
import * as t from "./lexer"


export class MobyParser extends CstParser {
  constructor() {
    super(allTokens)

    const $ = this
    const $$ = this as any

    $.RULE("script", () => {
        $.MANY_SEP({
            SEP: t.Newline,
            DEF: () => {
                $.SUBRULE($$.statement)
            }
        })
    })

    $.RULE("statement", () => {
        $.OR([
            {ALT: () => $.SUBRULE($$.staticStatement)}
        ])
    })

    $.RULE("staticStatement", () => {
        $.OR([
            {ALT: () => $.CONSUME(t.Comment)}
        ])
    })

    this.performSelfAnalysis()
  }
}