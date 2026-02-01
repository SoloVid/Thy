import { FilesApi } from "./files-api.ts"

export const generateUniqueName = async (
  fs: FilesApi,
  directory: string,
  baseName: string,
  isDirectory: boolean,
): Promise<string> => {
  // For directories, we need to handle the trailing slash in the check
  const checkPath = (name: string) => {
    const path = `${directory}/${name}${isDirectory ? "/" : ""}`
    return fs.exists(path)
  }

  // If the base name already has a number suffix, extract it
  const match = baseName.match(/^(.+?)(?:[ _-](\d+))?(\.\w+)?$/)
  if (!match) return baseName

  const [, nameWithoutNumber, existingNumber, extension] = match
  const ext = extension || ""
  const nameBase = nameWithoutNumber || baseName

  // Check if the base name exists
  if (!(await checkPath(baseName))) {
    return baseName
  }

  // Start with 1 or increment the existing number
  let counter = existingNumber ? parseInt(existingNumber, 10) + 1 : 1
  let newName = `${nameBase}${counter}${ext}`

  // Keep incrementing until we find a name that doesn't exist
  while (await checkPath(newName)) {
    newName = `${nameBase}${counter}${ext}`
    counter++
  }

  return newName
}
