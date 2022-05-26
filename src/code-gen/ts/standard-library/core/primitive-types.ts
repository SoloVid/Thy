import { makePrimitiveTypeGenerator } from "../helpers/primitive-type-generator";

export const booleanTypeGenerator = makePrimitiveTypeGenerator("Boolean", "boolean")
export const numberTypeGenerator = makePrimitiveTypeGenerator("Number", "number")
export const stringTypeGenerator = makePrimitiveTypeGenerator("String", "string")
export const unknownTypeGenerator = makePrimitiveTypeGenerator("Unknown", "unknown")
export const voidTypeGenerator = makePrimitiveTypeGenerator("Void", "undefined")
