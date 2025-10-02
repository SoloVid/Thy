import { globMatchAll, globToRegExp } from "utils/glob-match"
import { FileBrowseApi, PathFileEntry } from "utils/fs/file-browse-api"

function directoryOf(path: string) {
  return path.replace(/\/[^/]+$/, "")
}

function directoriesOf(path: string): readonly string[] {
  if (!path.includes("/")) {
    return [""]
  }
  const nearestDirectory = directoryOf(path)
  return [...directoriesOf(nearestDirectory), nearestDirectory]
}

export async function resolvePathSpec(sourceRelativePath: string, fileBrowser: FileBrowseApi, pathSpec: string): Promise<readonly string[]> {
  let matches: PathFileEntry[] = directoriesOf(sourceRelativePath).map(d => ({
    isDirectory: true,
    path: d,
  }))
  const pathSpecParts = pathSpec.split("/")

  async function expandGlob(start: string): Promise<readonly PathFileEntry []> {
    const children = await fileBrowser.list(start)
    const fullChildren = children.map(c => ({
      isDirectory: c.isDirectory,
      path: start ? `${start}/${c.name}` : c.name,
    }))
    const furtherDown = await Promise.all(fullChildren.map(c => expandGlob(c.path)))
    return [...fullChildren, ...furtherDown.flat()]
  }

  async function findMatches(pathSpecPart: string, start: string): Promise<readonly PathFileEntry []> {
    if (pathSpecPart === "**") {
      return expandGlob(start)
    }
    if (pathSpecPart.includes("**")) {
      throw new Error(`Glob is only supported for entire segments but got "${pathSpecPart}"`)
    }
    const possibleMatches = await fileBrowser.list(start)
    const regex = globToRegExp(pathSpecPart)
    const matches = possibleMatches.filter(e => regex.test(e.name)).map(e => ({
      isDirectory: e.isDirectory,
      path: start ? `${start}/${e.name}` : e.name,
    }))
    return matches
  }

  for (const pathSpecPart of pathSpecParts) {
    matches = (await Promise.all(matches.filter(m => m.isDirectory).map(s => findMatches(pathSpecPart, s.path)))).flat()
  }

  return matches.filter(m => !m.isDirectory).map(m => m.path)
}

export function resolvePathSpecSync(sourceRelativePath: string, knownFilePaths: readonly string[], pathSpec: string): readonly string[] {
  const possibleStartDirectories = directoriesOf(sourceRelativePath)
  return possibleStartDirectories.map(d => globMatchAll(d ? `${d}/${pathSpec}` : pathSpec, knownFilePaths)).flat()
}
