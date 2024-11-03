import type { GeneratorForNameParentSpec } from "../../generator-for-name"
import { makeBinaryNumberFunctionGenerator } from "../helpers/binary-number-function-generator"

const mathAddGenerator = makeBinaryNumberFunctionGenerator("add", "+")
const mathSubtractGenerator = makeBinaryNumberFunctionGenerator("subtract", "-")
const mathMultiplyGenerator = makeBinaryNumberFunctionGenerator("multiply", "*")
const mathDivideGenerator = makeBinaryNumberFunctionGenerator("divide", "/")
const mathModGenerator = makeBinaryNumberFunctionGenerator("mod", "%")

export const mathGenerator: GeneratorForNameParentSpec = {
  name: "math",
  children: [
    mathAddGenerator,
    mathSubtractGenerator,
    mathMultiplyGenerator,
    mathDivideGenerator,
    mathModGenerator,
  ],
}
