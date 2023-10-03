// Adapted from https://stackoverflow.com/a/20871714/4639640
export const permute = <T>(inputArr: readonly T[]): readonly (readonly T[])[] => {
  let result: T[][] = []

  const permuteInner = (arr: readonly T[], m: T[] = []) => {
    if (arr.length === 0) {
      result.push(m)
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice()
        let next = curr.splice(i, 1)
        permuteInner(curr.slice(), m.concat(next))
      }
    }
  }

  permuteInner(inputArr)

  return result
}
