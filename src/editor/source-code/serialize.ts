import { InMemoryFiles } from "../file/in-memory-files.ts"
import { SourceCodeManager } from "./manager.ts"

export function serialize(fs: InMemoryFiles, scm: SourceCodeManager) {
  return {
    root: fs.serialize(),
    selectedPath: scm.sourceOpen?.path ?? null,
  }
}
