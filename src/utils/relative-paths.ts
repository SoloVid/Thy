/**
 * Like `relative()` from `node:path` except path forms must match
 * and should be separated by forward slashes.
 */
export function relative(from: string, to: string) {
  const fromParts = from.split("/")
  const toParts = to.split("/")
  let resultPath = ""
  for (let i = 0; i < fromParts.length; i++) {
    if (resultPath) {
      resultPath = "../" + resultPath
    } else if (toParts[i] !== fromParts[i]) {
      resultPath = toParts.slice(i).join("/")
    }
  }
  if (!resultPath) {
    return "./" + toParts[toParts.length - 1]
  }
  if (!resultPath.startsWith("../")) {
    return "./" + resultPath
  }
  return resultPath
}
