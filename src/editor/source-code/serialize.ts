import { InMemoryFiles } from "../file/in-memory-files"
import { SourceCodeManager } from "./manager"

export function serialize(fs: InMemoryFiles, scm: SourceCodeManager) {
  return {
    root: fs.serialize(),
    selectedPath: scm.sourceOpen?.path ?? null,
  }
}
