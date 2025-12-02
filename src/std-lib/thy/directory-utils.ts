export function directoryOf(path: string) {
  return path.replace(/\/[^/]+$/, "")
}

export function directoriesOf(path: string): readonly string[] {
  if (!path.includes("/")) {
    return [""]
  }
  const nearestDirectory = directoryOf(path)
  return [...directoriesOf(nearestDirectory), nearestDirectory]
}
