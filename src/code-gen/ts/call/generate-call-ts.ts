import { isCall } from "tree"
import type { TreeNode, Call } from "tree"
import { makeGenerator } from "../../generate-from-options"
import {
  CodeGeneratorFunc,
  GeneratedSnippets,
  GeneratorFixture,
} from "../../generator"
import { fromComplicated } from "code-gen/utils/from-complicated"
import { fromTokenRange } from "code-gen/utils/from-token-range"
import { contextType, GeneratorState } from "../../generator-state"
import type { LibraryGeneratorCollection } from "../../library-generator"
import { generateTypeInstanceTs } from "../type/generate-type-instance-ts"
import { makeControlFlowCallTsGenerator } from "./generate-control-flow-call-ts"
import { tryGenerateReturnTs } from "./generate-return-ts"
import { tryGenerateAwaitCallTs } from "./generate-await-call-ts"

export function callGeneratorTs(standardLibrary: LibraryGeneratorCollection) {
  return makeCallTsGenerator([
    ...defaultCallTsGenerators,
    standardLibrary.callGenerator,
  ])
}

export const defaultCallTsGenerators = [
  tryGenerateAwaitCallTs,
  tryGenerateReturnTs,
  makeControlFlowCallTsGenerator("throw"),
]

export function makeCallTsGenerator(
  specializations: CodeGeneratorFunc<Call>[],
): CodeGeneratorFunc<TreeNode> {
  return makeGenerator(
    (node) => {
      if (isCall(node)) {
        return node
      }
    },
    generateCallTs,
    specializations,
  )
}

export function generateCallTs(
  call: Call,
  state: GeneratorState,
  fixture: GeneratorFixture,
  callName?: string,
): GeneratedSnippets {
  if (state.isTypeContext) {
    callName = callName ? `_${callName}` : state.getUniqueVariableName()
    const callValueSnippet = fixture.generate(
      call.func,
      state.makeChild({ context: contextType.isolatedExpression }),
    )
    const argsAsUnknown = call.args
      .map((a) => `${state.getUniqueVariableName()}: unknown, `)
      .join("")
    // TODO: Don't duplicate this logic from later down.
    const argSnippets = call.args.map((a, i) => {
      const childState = state.makeChild({
        context: contextType.isolatedExpression,
      })
      return [fixture.generate(a, childState), fromTokenRange(call, ", ")]
    })
    const wrappedValueFuncName = `${callName}_WrappedValue`
    const restParamsTypeName = `${callName}_RestParams`
    state.addPreStatementGenerator((s, f) =>
      fromComplicated(call, [
        `function ${wrappedValueFuncName} { return `,
        callValueSnippet,
        ` }`,
      ]),
    )
    state.addPreStatementGenerator((s, f) =>
      fromComplicated(call, [
        `type ${restParamsTypeName} = (ReturnType<typeof ${wrappedValueFuncName}>) extends (${argsAsUnknown}...rest: infer U) => unknown ? U : []`,
      ]),
    )
    return fromComplicated(call, [
      `${wrappedValueFuncName}()(`,
      argSnippets,
      `...([] as unknown[] as ${restParamsTypeName}))`,
    ])
  }

  const functionSnippet = fixture.generate(
    call.func,
    state.makeChild({ context: contextType.looseExpression }),
  )
  const typeArgSnippets = call.typeArgs.map((a, i) => {
    const childState = state.makeChild({
      context: contextType.isolatedExpression,
      isTypeContext: true,
    })
    if (i === 0) {
      return generateTypeInstanceTs(a, childState, fixture)
    }
    return [
      fromTokenRange(call, ", "),
      generateTypeInstanceTs(a, childState, fixture),
    ]
  })
  const argSnippets = call.args.map((a, i) => {
    const childState = state.makeChild({
      context: contextType.isolatedExpression,
    })
    if (i === 0) {
      return fixture.generate(a, childState)
    }
    return [fromTokenRange(call, ", "), fixture.generate(a, childState)]
  })
  return fromComplicated(call, [
    functionSnippet,
    ...(typeArgSnippets.length === 0 ? [] : ["<", typeArgSnippets, ">"]),
    "(",
    argSnippets,
    ")",
  ])
}
