// From https://sampleprograms.io/projects/josephus-problem/javascript/

export const josephusThy = `
josephus is def
  n is given
  k is given
  check.equal n 1
  let if that
    return 1
  and else
    From ((josephus(n - 1, k) + k - 1) % n) + 1
    math.subtract n 1
    josephus that k
    math.subtract k 1
    math.add beforeThat that
    math.mod that n
    math.add that 1
    return that

josephus 8 13
print that
josephus 9 14
return that
`

export const josephusJs = `
const josephus = (n, k) => {
  if (n == 1) return 1;
  else return ((josephus(n - 1, k) + k - 1) % n) + 1;
};

console.log(josephus(8, 13));
console.log(josephus(9, 14));
`
