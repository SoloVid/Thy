import { copyStaticFiles } from "../website/build/copy-static.ts"
import { generateHtmlFiles } from "../website/build/main.ts"
import { compileTs } from "./compile-ts.ts"

export function buildSite() {
  return Promise.all([generateHtmlFiles(), compileTs(), copyStaticFiles()])
}
