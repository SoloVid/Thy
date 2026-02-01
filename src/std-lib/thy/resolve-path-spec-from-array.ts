import { globMatchAll } from "utils/glob-match.ts"
import { directoriesOf } from "./directory-utils.ts"

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
