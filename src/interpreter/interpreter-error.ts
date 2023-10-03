import type { Atom, AtomSingle } from "./types"

export function makeInterpreterError(atom: Atom, message: string) {
  return new InterpreterErrorWithContext(new Error(message), atom)
}

export class InterpreterErrorWithContext extends Error {
  readonly cause: unknown
  readonly sourceLocation: { lineIndex: number, columnIndex: number }
  constructor(
    cause: unknown,
    atom: Atom,
    public readonly additionalDepthToShave: number = 0,
    public readonly altCloseError?: Error,
    public readonly altAdditionalDepthToShave: number = 0
  ) {
    super(cause instanceof Error ? cause.message : undefined)
    this.cause = cause
    this.sourceLocation = {
      lineIndex: atom.lineIndex,
      columnIndex: (atom as AtomSingle).columnIndex ?? 0,
    }
  }
}
