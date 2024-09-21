import { CompileError } from "compile-error"
import { SourcePosition } from "tokenizer/token"
import { TreeNode } from "tree"

export function makeInterpreterNodeError(node: TreeNode, message: string) {
  return new InterpreterErrorWithContext(
    new Error(message),
    "firstToken" in node ? node.firstToken : node.token,
  )
}

export function makeInterpreterCompileError(error: CompileError) {
  return new InterpreterErrorWithContext(new Error(error.message), error.start)
}

export class InterpreterErrorWithContext extends Error {
  readonly cause: unknown
  readonly sourceLocation: { line: number; column: number }
  constructor(
    cause: unknown,
    sourcePosition: SourcePosition,
    public readonly additionalDepthToShave: number = 0,
    public readonly altCloseError?: Error,
    public readonly altAdditionalDepthToShave: number = 0,
  ) {
    super(cause instanceof Error ? cause.message : undefined)
    this.cause = cause
    this.sourceLocation = {
      line: sourcePosition.line,
      column: sourcePosition.column ?? 0,
    }
  }
}
