import { fromComplicated } from "code-gen/utils/from-complicated"
import type { TreeNode, TypeCall, ValueCall } from "tree"
import type { GeneratedSnippets } from "../../generator"
import { makeGenerator } from "../generate-from-options"
import { GeneratorState } from "../generator-state"
import { contextType } from "../generator-context"
import type { LibraryGeneratorCollection } from "../library-generator"
import type { CodeGeneratorFunc, GeneratorFixture } from "../ts-generator"
import { generateTypeArgsTs } from "../type/generate-type-args-ts"
import { separateSnippetsWithCommas } from "../utils/comma-separated-snippets"
import { makeControlFlowCallTsGenerator } from "./generate-control-flow-call-ts"
import { trace } from "../utils/debug"
import { fromNode } from "code-gen/utils/from-node"
import { nodeToString } from "code-gen/utils/to-string"

export function valueCallGeneratorTs(
  standardLibrary: LibraryGeneratorCollection,
) {
  return makeValueCallTsGenerator([standardLibrary.callGenerator])
}

export function makeValueCallTsGenerator(
  specializations: CodeGeneratorFunc<ValueCall>[],
): CodeGeneratorFunc<TreeNode> {
  return makeGenerator(
    (node) => {
      if (node.type === "value-call") {
        return node
      }
    },
    generateValueCallTs,
    specializations,
  )
}

export function generateValueCallTs(
  call: ValueCall,
  state: GeneratorState,
  fixture: GeneratorFixture,
  callName?: string,
): GeneratedSnippets {
  trace(`generateValueCallTs() <= ${nodeToString(call)}`)
  // console.log(state)
  if (state.isTypeContext) {
    return generateCallTsInTypeContext(call, state, fixture, callName)
  }

  const { functionSnippet, typeArgSnippets, argSnippets } =
    generateValueCallPartsTs(call, state, fixture)

  return fromComplicated(call, [
    functionSnippet,
    generateTypeArgsTs(call, typeArgSnippets),
    "(",
    separateSnippetsWithCommas(call, argSnippets),
    ")",
  ])
}

export function generateCallTsInTypeContext(
  call: ValueCall | TypeCall,
  state: GeneratorState,
  fixture: GeneratorFixture,
  callName?: string,
): GeneratedSnippets {
  trace("generateCallTsInTypeContext()")
  callName = callName
    ? `_${callName}`
    : state.assignmentContextName
      ? `_${state.assignmentContextName}`
      : state.getUniqueVariableName()
  const { functionSnippet, typeArgSnippets, argSnippets } = generateCallPartsTs(
    call,
    state,
    fixture,
  )

  const argsAsUnknown = call.args
    .map((a) => `${state.getUniqueVariableName()}: unknown, `)
    .join("")

  const wrappedValueFuncName = `${callName}_WrappedValue`
  const restParamsTypeName = `${callName}_RestParams`
  state.addPreStatementGenerator((s, f) =>
    fromComplicated(call, [
      `function ${wrappedValueFuncName}() { return `,
      functionSnippet,
      generateTypeArgsTs(call, typeArgSnippets),
      ` }`,
    ]),
  )
  state.addPreStatementGenerator((s, f) =>
    fromComplicated(call, [
      `type ${restParamsTypeName} = ReturnType<typeof ${wrappedValueFuncName}> extends (${argsAsUnknown}...rest: infer U) => unknown ? U : []`,
    ]),
  )
  return fromComplicated(call, [
    `${wrappedValueFuncName}()(`,
    separateSnippetsWithCommas(call, [
      ...argSnippets,
      fromNode(call, `...([] as unknown[] as ${restParamsTypeName})`),
    ]),
    `)`,
  ])
}

function generateCallPartsTs(
  call: ValueCall | TypeCall,
  state: GeneratorState,
  fixture: GeneratorFixture,
) {
  if (call.type === "value-call") {
    return generateValueCallPartsTs(call, state, fixture)
  } else {
    return generateTypeCallPartsTs(call, state, fixture)
  }
}

function generateValueCallPartsTs(
  call: ValueCall,
  state: GeneratorState,
  fixture: GeneratorFixture,
) {
  const functionSnippet = fixture.generate(
    call.func,
    state.makeChild({ context: contextType.looseExpression }),
  )
  const typeArgSnippets = call.typeArgs.map((a, i) => {
    const childState = state.makeChild({
      context: contextType.isolatedExpression,
      isTypeContext: true,
    })
    return fixture.generateAsType(a, childState)
  })
  const argSnippets = call.args.map((a, i) => {
    const childState = state.makeChild({
      context: contextType.isolatedExpression,
    })
    return fixture.generate(a, childState)
  })
  return {
    functionSnippet,
    typeArgSnippets,
    argSnippets,
  }
}

function generateTypeCallPartsTs(
  call: TypeCall,
  state: GeneratorState,
  fixture: GeneratorFixture,
) {
  const functionSnippet = fixture.generate(
    call.func,
    state.makeChild({ context: contextType.looseExpression }),
  )
  const typeArgSnippets = call.args.map((a, i) => {
    const childState = state.makeChild({
      context: contextType.isolatedExpression,
    })
    return fixture.generateAsType(a, childState)
  })
  return {
    functionSnippet,
    typeArgSnippets,
    argSnippets: [],
  }
}
