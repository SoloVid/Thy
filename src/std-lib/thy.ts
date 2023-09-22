
export function makeThy<
  BlocksTuple extends readonly (() => void | Record<string, unknown>)[]
>({
  blocks,
}: {
  blocks: BlocksTuple
}) {
  type ReturnTypes = {
    [K in keyof BlocksTuple]: ReturnType<BlocksTuple[K]>
  }[number]
  type ObjectReturnTypes = Exclude<ReturnTypes, void>
  type AggregateOutput = AssertRecord<UnionToIntersection<ObjectReturnTypes>>
  const values: Record<string, unknown> = {}
  return <
    OutputKey extends (string & keyof AggregateOutput) | void = void
  >(
    ...[outputKey]: ThyFunctionParameters<AggregateOutput, OutputKey>
  ): ThyFunctionOutput<AggregateOutput, OutputKey> => {
    for (const block of blocks) {
      const newValues = block()
      if (newValues) {
        for (const [key, value] of Object.entries(newValues)) {
          values[key] = value
        }
      }
    }
    if (outputKey) {
      return values[outputKey] as ThyFunctionOutput<AggregateOutput, OutputKey>
    }
    return undefined as ThyFunctionOutput<AggregateOutput, OutputKey>
  }
}
// From https://stackoverflow.com/a/50375286/4639640
type UnionToIntersection<U> = 
  (U extends any ? (k: U)=>void : never) extends ((k: infer I)=>void) ? I : never

type AssertRecord<T> = T extends Record<string, unknown> ? T : never

type ThyFunctionParameters<AggregateOutput extends Record<string, unknown>, OutputKey extends (string & keyof AggregateOutput) | void> = OutputKey extends void ? [] : [key: OutputKey]
type ThyFunctionOutput<AggregateOutput extends Record<string, unknown>, OutputKey extends (string & keyof AggregateOutput) | void> = OutputKey extends void ? void : OutputKey extends keyof AggregateOutput ? AggregateOutput[OutputKey] : never

// From https://gist.github.com/webstrand/b6c8a1bb019f156a3b2b0e553370b18d
type Expand<T> = T extends string | number | boolean | bigint | null | void | symbol | Function | Date ? T : { [K in keyof T]: T[K] }
type VoidToEmptyObject<T extends Record<string, unknown> | void> = T extends void ? "aggh" : T
