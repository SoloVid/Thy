import { addThyPrismGrammarAndAwaitAvailable } from "../../editor/prism-grammar.ts"
import { generateApiReference, generateHtmlAll } from "./helper.ts"

export async function generateHtmlFiles() {
  await addThyPrismGrammarAndAwaitAvailable()
  await generateHtmlAll()
  await Promise.all([
    generateApiReference("std-lib/core"),
    generateApiReference("std-lib/playground"),
  ])
}
