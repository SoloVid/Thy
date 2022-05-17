import type { SourcePosition } from "../tokenizer/token"
import type { CompileError as InternalError } from "../compile-error"
import { codeFrameColumns, SourceLocation as CodeFrameSourceLocation } from "@babel/code-frame"

export interface CompileError {
    message: string
    /** Start of error (inclusive). */
    start: SourcePosition
    /** End of error (exclusive). */
    end: SourcePosition
    /** Contextual error, great for printing to console. */
    contextualizedErrorMessage: string
}

export function convertFromInternalError(internalError: InternalError, source: string): CompileError {
    const newlineCountInEndText = (internalError.end.text.match(/\n/g) ?? []).length
    const simplifiedLocation = {
        start: {
            offset: internalError.start.offset,
            line: internalError.start.line,
            column: internalError.start.column
        },
        end: {
            offset: internalError.end.offset + internalError.end.text.length,
            line: internalError.end.line + newlineCountInEndText,
            column: newlineCountInEndText === 0 ?
                internalError.end.column + internalError.end.text.length :
                internalError.end.text.length - (internalError.end.text.lastIndexOf('\n') + 1)
        }
    }
    const locationForCodeFrame: CodeFrameSourceLocation = {
        start: { line: simplifiedLocation.start.line + 1, column: simplifiedLocation.start.column + 1 }
    }
    if (internalError.start.text !== '' || internalError.end.text !== '') {
        if (simplifiedLocation.end.line === simplifiedLocation.start.line) {
            // For whatever insane reason, my tests show that the end column is exclusive if on the same line but inclusive if on a later line.
            locationForCodeFrame.end = { line: simplifiedLocation.end.line + 1, column: simplifiedLocation.end.column + 1 }
        } else if (simplifiedLocation.end.column > 0) {
            locationForCodeFrame.end = { line: simplifiedLocation.end.line + 1, column: simplifiedLocation.end.column }
        } else {
            const sourceLines = source.split('\n')
            const previousLine = sourceLines[simplifiedLocation.end.line].trimEnd()
            locationForCodeFrame.end = { line: simplifiedLocation.end.line, column: previousLine.length }
        }
    }
    return {
        message: internalError.message,
        ...simplifiedLocation,
        contextualizedErrorMessage: codeFrameColumns(source, locationForCodeFrame, {
            // message: internalError.message
        })
    }
}
