import { Indent, lexer, StatementSeparator, Outdent } from "./lexer"
import { MobyParser } from "./parser"
import { createTokenInstance } from "chevrotain"
import { readProgram } from "./read-program"

export async function runLexExample() {
  const source = await readProgram("example-program.thy")
  const lexingResult = lexer.tokenize(source)
  const tokens = lexingResult.tokens
  const [indentCount, outdentCount] = tokens.reduce((total, token) => {
    if (token.tokenType === Indent) {
      return [total[0] + 1, total[1]]
    }
    if (token.tokenType === Outdent) {
      return [total[0], total[1] + 1]
    }
    return total
  }, [0, 0])

  if (outdentCount > indentCount) {
    throw new Error('How are there more outdents?')
  }

  // Add trailing outdents
  for (let i = outdentCount; i < indentCount; i++) {
    tokens.push(createTokenInstance(Outdent, "", NaN, NaN, NaN, NaN, NaN, NaN))
  }

  // Remove newlines before indents
  // for (let i = 0; i < tokens.length - 1; i++) {
  //   while (tokens[i].tokenType === Newline
  //     && (tokens[i + 1].tokenType === Newline || tokens[i + 1].tokenType === Indent)
  //   ) {
  //     tokens.splice(i, 1)
  //   }
  // }

  tokens.map(t => {return {
      image: t.image,
      tokenType: t.tokenType.name
  }}).forEach(e => console.log(e))
  console.error(lexingResult.errors)

  const parser = new MobyParser()
  parser.input = tokens;
  const cstOutput = (parser as any).script()
  console.log(cstOutput)
  console.error(parser.errors)
}
