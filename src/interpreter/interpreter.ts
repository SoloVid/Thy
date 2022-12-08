import assert from "assert"

export function interpretThyBlock(thySource: string): (...args: readonly unknown[]) => unknown {
  const lines = thySource.split(/\r\n|\n/)
  return interpretThyBlockLines(lines)
}

// From https://stackoverflow.com/a/249937/4639640
const stringRegex = /"((?:[^"\\]|\\.)*)"/
const numberRegex = /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/

type ThyBlockContext = {
  argsToUse: unknown[]
  variablesInBlock: Record<string, unknown>
}

export function interpretThyBlockLines(thySourceLines: readonly string[]): (...args: readonly unknown[]) => unknown {
  return (...args: readonly unknown[]) => {
    const context: ThyBlockContext = {
      argsToUse: [...args],
      variablesInBlock: {},
    }
    for (const line of thySourceLines) {
      const parts = line.split(" ")
      if (parts.length > 0) {
        // if (parts[0] === "given") {
        //   assert(parts.length === 2 || parts.length === 3, `given takes one or two parameters`)
        //   context.variablesInBlock[parts[1]] = context.argsToUse.shift()
        //   continue
        // }
        if (parts[0] === "return") {
          assert(parts.length === 2, `return takes exactly one parameter`)
          return interpretThyExpression(context, parts[1])
        }

        interpretThyStatement(context, parts)

        // if (parts.length > 1 && parts[1] === "is") {
        //   context.variablesInBlock[parts[0]] = interpretThyCall(context, parts.slice(2))
        //   continue
        // }

        // interpretThyCall(context, parts)
        // const [functionExpression, ...callArgExpressions] = parts
        // const callArgs = callArgExpressions.map(a => interpretThyExpression(context, a))
        // const f = interpretThyExpression(context, functionExpression) as (...args: readonly unknown[]) => unknown
        // f(...callArgs)
      }
    }
  }
}

function interpretThyStatement(context: ThyBlockContext, parts: readonly string[]): void {
  if (parts[0] === "given") {
    assert(parts.length === 2 || parts.length === 3, `given takes one or two parameters`)
    context.variablesInBlock[parts[1]] = context.argsToUse.shift()
    return
  }
  if (parts.length > 1 && parts[1] === "is") {
    context.variablesInBlock[parts[0]] = interpretThyCall(context, parts.slice(2))
    return
  }

  interpretThyCall(context, parts)
}

function interpretThyExpression(context: ThyBlockContext, thyExpression: string): unknown {
  if (numberRegex.test(thyExpression)) {
    return parseFloat(thyExpression)
  }
  const stringMatch = stringRegex.exec(thyExpression)
  if (stringMatch !== null) {
    return stringMatch[1]
  }
  return context.variablesInBlock[thyExpression]
}

function interpretThyCall(context: ThyBlockContext, parts: readonly string[]): unknown {
  const [functionExpression, ...callArgExpressions] = parts
  const callArgs = callArgExpressions.map(a => interpretThyExpression(context, a))
  const f = interpretThyExpression(context, functionExpression) as (...args: readonly unknown[]) => unknown
  assert(typeof f === "function", `${functionExpression} is not a function`)
  return f(...callArgs)
}
