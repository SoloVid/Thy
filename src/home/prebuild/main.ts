import { addThyPrismGrammarAndAwaitAvailable } from "../../editor/prism-grammar"
import { generateHtmlAll } from "./helper"
import generateCoreStdLib from "./pages/std-lib/core"
import generatePlaygroundStdLib from "./pages/std-lib/playground"

export async function generateHtmlFiles() {
  await addThyPrismGrammarAndAwaitAvailable()
  await Promise.all([
    generateHtmlAll(),
    generateCoreStdLib(),
    generatePlaygroundStdLib(),
  ])
}
