import { b } from "."

export const a = "A"

const b0 = b

export function printA() {
    console.log(a)
    console.log("A's b0: " + b0)
    console.log("A's b: " + b)
}
