import { stringRegex } from "./patterns"

export function splitLineParts(line: string): readonly string[] {
  const substitutions: Record<string, string> = {}
  return line
    .trim()
    .replace(new RegExp(stringRegex, "g"), (match) => {
      const id = generateUID()
      substitutions[id] = match
      return id
    })
    .split(" ")
    .map(p => p in substitutions ? substitutions[p] : p)
    .filter(p => !/^[A-Z]/.test(p))
}

// Implementation from https://stackoverflow.com/a/1349426/4639640
function generateUID(length: number = 16) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
