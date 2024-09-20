import assert from "assert"
import type { Token } from "../tokenizer/token"
import { tEndBlock, tEndStream, tStartBlock } from "../tokenizer/token-type"
import { Block, ReturnStyle, returnStyle } from "../tree/block"
import { badParse } from "./error"
import { evaluateReturnStyle } from "./evaluate-return-style"
import { getLastToken } from "./helper"
import { isIdeaAsync, parseIdea } from "./parse-idea"
import type { ParserContext, ParserState } from "./parser-state"
import { makeThatIdeaTracker } from "./that-idea-tracker"

export function parseBlock(state: ParserState): Block {
  const firstToken = state.buffer.consumeToken()
  assert(firstToken.type === tStartBlock)

  const result = parseBlockInner(state)

  const lastToken = state.buffer.consumeToken()
  assert(lastToken.type === tEndBlock)

  return result
}

export function parseBlockInner(state: ParserState): Block {
  const parentContext = state.context

  let blockReturnStyle: ReturnStyle = returnStyle.implicitExport
  let isAsync = false
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

      // if (idea !== badParse) {
      blockReturnStyle = evaluateReturnStyle(state, blockReturnStyle, idea)
      isAsync = isAsync || isIdeaAsync(idea)
      // }

      nextToken = state.buffer.peekToken()
    }

    const ideas = thatIdeaTracker.ideas
    const lastToken =
      ideas.length > 0 ? getLastToken(ideas[ideas.length - 1]) : firstToken
    return {
      type: "block",
      symbolTable: context.symbolTable,
      ideas: ideas,
      returnStyle: blockReturnStyle,
      isAsync: isAsync,
      firstToken: firstToken,
      lastToken: lastToken,
    }
  } finally {
    state.context = parentContext
  }
}
