import type { GeneratorForGlobalParentSpec } from "../../../generator-for-global";
import { makeBinaryNumberFunctionGenerator } from "../helpers/binary-number-function-generator";

const mathAddGenerator = makeBinaryNumberFunctionGenerator('add', '+')
const mathSubtractGenerator = makeBinaryNumberFunctionGenerator('subtract', '-')
const mathMultiplyGenerator = makeBinaryNumberFunctionGenerator('multiply', '*')
const mathDivideGenerator = makeBinaryNumberFunctionGenerator('divide', '/')
const mathModGenerator = makeBinaryNumberFunctionGenerator('mod', '%')

export const mathGenerator: GeneratorForGlobalParentSpec = {
    name: "math",
    children: [
        mathAddGenerator,
        mathSubtractGenerator,
        mathMultiplyGenerator,
        mathDivideGenerator,
        mathModGenerator,
    ],
}


