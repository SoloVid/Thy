import { stringRegex } from "./patterns"

export type LinePart = {
  text: string
  index: number
}

export function splitLineParts(line: string): LinePart[] {
  const partPattern = /"""|"(?:(?:[^"\\]|\\.)*)"|[^ ]+/y
  let i = 0
  partPattern.lastIndex = i
  const results: LinePart[] = []
  while (i < line.length) {
    const m = partPattern.exec(line)
    if (m) {
      const part = {
        text: m[0],
        index: i,
      }
      if (!/^[A-Z]/.test(part.text)) {
        results.push(part)
      }
      i = partPattern.lastIndex > 0 ? partPattern.lastIndex : line.length
    } else {
      i++
      partPattern.lastIndex = i
    }
  }

  return results
}

// Implementation from https://stackoverflow.com/a/1349426/4639640
export function generateUID(length: number = 16) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
