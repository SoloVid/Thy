import { FileBrowseApi, PathFileEntry } from "utils/fs/file-browse-api.ts"
import { globToRegExp } from "utils/glob-match.ts"
import { directoriesOf } from "./directory-utils.ts"

export async function resolvePathSpecFromFs(
  sourceRelativePath: string,
  fileBrowser: FileBrowseApi,
  pathSpec: string,
): Promise<readonly string[]> {
  let matches: PathFileEntry[] = directoriesOf(sourceRelativePath).map((d) => ({
    isDirectory: true,
    path: d,
  }))
  const pathSpecParts = pathSpec.split("/")

  async function expandGlob(start: string): Promise<readonly PathFileEntry[]> {
    const children = await fileBrowser.list(start)
    const fullChildren = children.map((c) => ({
      isDirectory: c.isDirectory,
      path: start ? `${start}/${c.name}` : c.name,
    }))
    const furtherDown = await Promise.all(
      fullChildren.map((c) => expandGlob(c.path)),
    )
    return [...fullChildren, ...furtherDown.flat()]
  }

  async function findMatches(
    pathSpecPart: string,
    start: string,
  ): Promise<readonly PathFileEntry[]> {
    if (pathSpecPart === "**") {
      return expandGlob(start)
    }
    if (pathSpecPart.includes("**")) {
      throw new Error(
        `Glob is only supported for entire segments but got "${pathSpecPart}"`,
      )
    }
    const possibleMatches = await fileBrowser.list(start)
    const regex = globToRegExp(pathSpecPart)
    const matches = possibleMatches
      .filter((e) => regex.test(e.name))
      .map((e) => ({
        isDirectory: e.isDirectory,
        path: start ? `${start}/${e.name}` : e.name,
      }))
    return matches
  }

  for (const pathSpecPart of pathSpecParts) {
    matches = (
      await Promise.all(
        matches
          .filter((m) => m.isDirectory)
          .map((s) => findMatches(pathSpecPart, s.path)),
      )
    ).flat()
  }

  return matches.filter((m) => !m.isDirectory).map((m) => m.path)
}
