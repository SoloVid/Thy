import { globMatchAll } from "utils/glob-match"
import { directoriesOf } from "./directory-utils"

export function resolvePathSpecFromArray(
  sourceRelativePath: string,
  knownFilePaths: readonly string[],
  pathSpec: string,
): readonly string[] {
  const possibleStartDirectories = directoriesOf(sourceRelativePath)
  return possibleStartDirectories
    .map((d) => globMatchAll(d ? `${d}/${pathSpec}` : pathSpec, knownFilePaths))
    .flat()
}
