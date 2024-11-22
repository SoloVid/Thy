import type { CompileError } from "common/compile-error"
import type { Token } from "tokenizer/token"
import type { Block, ReadSymbolTable } from "tree"
import type { GeneratedSnippet, GeneratedSnippets } from "../generator"
import {
  ContextType,
  contextType,
  isExpressionContext,
} from "./generator-context"
import type { IndependentCodeGeneratorFunc } from "./ts-generator"

interface GeneratorStateOptions {
  readonly symbolTable?: ReadSymbolTable
  readonly block?: GeneratorBlockState
  readonly context?: ContextType
  readonly increaseIndent?: boolean
  readonly isTypeContext?: boolean
  readonly assignmentContextName?: string | null
  readonly newImplicitArguments?: boolean | string
  readonly newPreStatementsArray?: boolean
}

export interface ImplicitArgumentsState {
  readonly variableName: string
  readonly used: boolean
  markImplicitArgumentUsed(): void
}

export interface GeneratorBlockState {
  readonly typeParametersSoFar: {
    /** Name of type parameter *in TypeScript* (might be different from name in Thy source). */
    readonly name: string
    /** TypeScript generated for type parameter specification (item in comma-separated list inside `<...>`). */
    readonly inlineSnippet: GeneratedSnippets
  }[]
  readonly parametersSoFar: {
    /** TypeScript generated for parameter specification (item in comma-separated list inside `(...)`). */
    readonly inlineSnippet: GeneratedSnippets
  }[]
  readonly ideaSnippets: (GeneratedSnippet[])[]
  /**
   * If something needs to be generated in a statement context prior
   * to the current block (e.g. we're putting something into
   * blockTypeParametersSoFar or blockParametersSoFar),
   * it can be added to this array.
   */
  readonly preStatementGenerators: IndependentCodeGeneratorFunc[]
  returnTypeSnippets: GeneratedSnippets | null
}

export function makeGeneratorBlockState(block: Block): GeneratorBlockState {
  return {
    typeParametersSoFar: [],
    parametersSoFar: [],
    ideaSnippets: [],
    preStatementGenerators: [],
    returnTypeSnippets: null,
  }
}

export interface GeneratorState {
  readonly symbolTable: ReadSymbolTable | null
  readonly block: GeneratorBlockState | null
  readonly context: ContextType
  readonly indentLevel: number
  readonly isTypeContext: boolean
  /** Singleton(ish) array of errors encountered. */
  readonly errors: CompileError[]
  readonly assignmentContextName: string | null
  /**
   * If something needs to be generated in a statement context prior
   * to the current statement (e.g. we're in a nested expression),
   * it can be added to this array.
   */
  readonly preStatementGenerators: IndependentCodeGeneratorFunc[]
  readonly localVariables: LocalVariable[]
  readonly parent: GeneratorState | null
  readonly implicitArguments: ImplicitArgumentsState | null
  addError(error: CompileError): void
  /** Queue up a generator that needs to be run in a dedicated statement context prior to the current expression context. */
  addPreStatementGenerator(generator: IndependentCodeGeneratorFunc): void
  getUniqueVariableName(): string
  isExpressionContext(): boolean
  makeChild(options?: GeneratorStateOptions): GeneratorState
}

export interface LocalVariable {
  token: Token
  name: string
  isConstant: boolean
}

export function makeGeneratorState(
  parent?: GeneratorState,
  options: GeneratorStateOptions = {},
): GeneratorState {
  let nextVar = 1
  const getUniqueVariableName =
    parent?.getUniqueVariableName ??
    (() => {
      return `_${nextVar++}`
    })
  const me = {
    errors: parent?.errors ?? ([] as CompileError[]),
    preStatementGenerators: options.newPreStatementsArray
      ? []
      : (parent?.preStatementGenerators ?? []),
    indentLevel: options.increaseIndent
      ? parent
        ? parent.indentLevel + 1
        : 1
      : parent
        ? parent.indentLevel
        : 0,
    isTypeContext:
      options.isTypeContext !== undefined
        ? options.isTypeContext
        : (parent?.isTypeContext ?? false),
    assignmentContextName: options.assignmentContextName !== undefined ? options.assignmentContextName : (parent?.assignmentContextName ?? null),
    getUniqueVariableName,
    symbolTable: options.symbolTable ?? parent?.symbolTable ?? null,
    block: options.block ?? parent?.block ?? null,
    context:
      options.context !== undefined
        ? options.context
        : (contextType.looseExpression as ContextType),
    localVariables: [],
    parent: parent ?? null,
    implicitArguments: options.newImplicitArguments
      ? {
          variableName:
            typeof options.newImplicitArguments === "string"
              ? options.newImplicitArguments
              : getUniqueVariableName(),
          used: false,
          markImplicitArgumentUsed() {
            this.used = true
            parent?.implicitArguments?.markImplicitArgumentUsed()
          },
        }
      : (parent?.implicitArguments ?? null),
    addError(error: CompileError) {
      this.errors.push(error)
    },
    addPreStatementGenerator(generator: IndependentCodeGeneratorFunc) {
      this.preStatementGenerators.push(generator)
    },
    isExpressionContext() {
      return isExpressionContext(this.context)
    },
    makeChild(options: GeneratorStateOptions = {}) {
      return makeGeneratorState(me, options)
    },
  }
  return me
}
