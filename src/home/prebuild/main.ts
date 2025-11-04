import { addThyPrismGrammarAndAwaitAvailable } from "../../editor/prism-grammar"
import { generateApiReference, generateHtmlAll } from "./helper"

export async function generateHtmlFiles() {
  await addThyPrismGrammarAndAwaitAvailable()
  await generateHtmlAll()
  await Promise.all([
    generateApiReference("std-lib/core"),
    generateApiReference("std-lib/playground"),
  ])
}
