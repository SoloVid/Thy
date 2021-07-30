import fs from "fs/promises"
import { join } from "path"

export async function readProgram(fileName: string) {
    const buffer = await fs.readFile(join(__dirname, "..", fileName))
    return buffer.toString()
}