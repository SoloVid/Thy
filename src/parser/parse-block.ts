import type { Token } from "tokenizer"
import { tEndBlock, tEndStream, tStartBlock } from "tokenizer/token-type.ts"
import { Block, isIdeaAsync, ReturnStyle, returnStyle } from "tree"
import { hasIdeaGiven } from "tree/idea.ts"
import { SymbolTable } from "tree/symbol-table.ts"
import assert from "utils/assert.ts"
import { addNodeError } from "./error.ts"
import { evaluateReturnStyle } from "./evaluate-return-style.ts"
import { getLastToken } from "./helper.ts"
import { parseIdea } from "./parse-idea.ts"
import type { ParserContext, ParserState } from "./parser-state.ts"
import { makeThatIdeaTracker } from "./that-idea-tracker.ts"

export function parseBlock(state: ParserState): Block {
  const firstToken = state.buffer.consumeToken()
  assert(
    firstToken.type === tStartBlock,
    "parseBlock() should only be called if next token is start block",
  )

  const result = parseBlockInner(state)

  const lastToken = state.buffer.consumeToken()
  assert(
    lastToken.type === tEndBlock,
    "parseBlock() should always have closing end block token",
  )

  return result
}

export function parseBlockInner(state: ParserState): Block {
  const parentContext = state.context

  let blockReturnStyle: ReturnStyle = returnStyle.implicitExport
  let isAsync = false
  let explicitParameterCount = 0
  let returnTypeCount = 0
  const thatIdeaTracker = makeThatIdeaTracker(state.addError)

  const context: ParserContext = {
    symbolTable: parentContext.symbolTable.makeChild(),
    takeThat: thatIdeaTracker.takeThat,
  }
  state.context = context

  try {
    const firstToken = state.buffer.peekToken()
    let nextToken: Token = firstToken
    while (nextToken.type !== tEndBlock && nextToken.type !== tEndStream) {
      const idea = parseIdea(state)
      thatIdeaTracker.shareLatestIdea(idea)

      blockReturnStyle = evaluateReturnStyle(state, blockReturnStyle, idea)
      isAsync = isAsync || isIdeaAsync(idea)
      if (hasIdeaGiven(idea)) {
        explicitParameterCount++
      }
      if (
        idea.type === "type-return" ||
        (idea.type === "return" && idea.typeArgs.length !== 0)
      ) {
        returnTypeCount++
        if (returnTypeCount > 1) {
          addNodeError(
            state,
            idea,
            "Return type cannot be specified more than once in a block",
          )
        }
      }

      nextToken = state.buffer.peekToken()
    }

    const ideas = thatIdeaTracker.ideas
    const lastToken = ideas.length > 0
      ? getLastToken(ideas[ideas.length - 1])
      : firstToken
    return {
      type: "block",
      symbolTable: context.symbolTable,
      explicitParameterCount: explicitParameterCount,
      isAsync: isAsync,
      ideas: ideas,
      returnStyle: blockReturnStyle,
      exportedSymbols: getExportedSymbols(
        blockReturnStyle,
        context.symbolTable,
      ),
      firstToken: firstToken,
      lastToken: lastToken,
    }
  } finally {
    state.context = parentContext
  }
}

function getExportedSymbols(
  blockReturnStyle: ReturnStyle,
  symbolTable: SymbolTable,
): Block["exportedSymbols"] {
  if (blockReturnStyle === returnStyle.explicitReturn) {
    return []
  }
  if (blockReturnStyle === returnStyle.explicitExport) {
    return [...symbolTable.localSymbols.entries()]
      .filter(([name, info]) => info.visibility === "export")
      .map(([name, info]) => name)
  }
  return [...symbolTable.localSymbols.entries()]
    .filter(([name, info]) => info.visibility === "bare")
    .map(([name, info]) => name)
}
