import { copyStaticFiles } from "../website/build/copy-static"
import { generateHtmlFiles } from "../website/build/main"
import { compileTs } from "./compile-ts"

export function buildSite() {
  return Promise.all([
    generateHtmlFiles(),
    compileTs(),
    copyStaticFiles(),
  ])
}
