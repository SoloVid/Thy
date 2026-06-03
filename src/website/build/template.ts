import { Mutex } from "async-mutex"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

const templateHtmlMutex = new Mutex()
// deno-lint-ignore prefer-const
let templateHtml: string | null = null
export async function getTemplateHtml() {
  return await readFile(join(import.meta.dirname!, "template.html"), "utf-8")
  // TODO: Use cache again. Didn't work well for dev.
  // return templateHtmlMutex.runExclusive(async () => {
  //   if (templateHtml === null) {
  //     templateHtml = await readFile(join(import.meta.dirname!, "template.html"), "utf-8")
  //   }
  //   return templateHtml
  // })
}
