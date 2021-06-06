import { Indent, lexer, Outdent } from "./lexer"
import { MobyParser } from "./parser"
import { source } from "./example-program"
import { createTokenInstance } from "chevrotain"

export function runLexExample() {
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

  for (let i = outdentCount; i < indentCount; i++) {
    tokens.push(createTokenInstance(Outdent, "", NaN, NaN, NaN, NaN, NaN, NaN))
  }

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
