// These context types are listed in order from most restrictive to most permissive.

export const contextType = {
  /**
   * Indicates we are within a "loose" (potentially ambiguous) expression (e.g. a binary logical operation).
   * Within this type of context, generated expressions need to remove any ambiguity from themselves.
   * Function call, literal, or identifier? Fine.
   * Binary operation? Wrap it in parens.
   */
  looseExpression: "looseExpression",
  /**
   * Indicates we are within an isolated expression (e.g. function parameter).
   * Within this type of context, generated expressions may assume isolation and forgo enclosing parens.
   */
  isolatedExpression: "isolatedExpression",
  /**
   * Are we within a part of the program that has the ability to return?
   * Within this type of context, generated code may actually be statements instead of just expressions.
   * These statements MAY NOT EFFECT A RETURN (e.g. `return` or `await` require IIFE wrapping).
   */
  blockNoReturn: "blockNoReturn",
  /**
   * Are we within a part of the program that has the ability to return?
   * Within this type of context, generated code may actually be statements
   * (including await and return) instead of just expressions.
   */
  blockAllowingReturn: "blockAllowingReturn",
  /**
   * The top-level block of the whole program.
   */
  topLevel: "topLevel",
} as const

export type ContextType = (typeof contextType)[keyof typeof contextType]

export function isExpressionContext(context: ContextType) {
  return (
    context === contextType.looseExpression ||
    context === contextType.isolatedExpression
  )
}
