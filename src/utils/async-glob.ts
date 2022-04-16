import { glob, IOptions } from "glob"

export async function asyncGlob(pattern: string, options?: IOptions): Promise<readonly string[]> {
    return new Promise((resolve, reject) => {
        glob(pattern, options ?? {}, (e, matches) => {
            if (e) {
                reject(e)
            } else {
                resolve(matches)
            }
        })
    })
}