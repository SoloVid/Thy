import { b } from "."

export const c = "C"

const b0 = b

export function printC() {
    console.log(c)
    console.log("C's b0: " + b0)
    console.log("C's b: " + b)
}