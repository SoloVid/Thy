import { lexer } from "./lexer"
import { MobyParser } from "./parser"
import { source } from "./example-program"

export function runLexExample() {
  const lexingResult = lexer.tokenize(source)

  lexingResult.tokens.map(t => {return {
      image: t.image,
      tokenType: t.tokenType.name
  }}).forEach(e => console.log(e))
  console.error(lexingResult.errors)

  const parser = new MobyParser()
  parser.input = lexingResult.tokens;
  const cstOutput = (parser as any).script()
  console.log(cstOutput)
  console.error(parser.errors)
}
