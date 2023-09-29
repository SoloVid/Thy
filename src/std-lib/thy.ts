// type BaseBlockMap = Record<string, (args: { thy: (...keyArgs: ([keyArgsKey: string] | [])) => never }) => unknown>
// type BaseBlockMap = Record<string, (args: { thy: (...args: any) => any }) => unknown>
type BaseBlockMap = Record<string, (args: { thy: ThyFunction<any> }) => unknown>
type BlockMapReturns<BlockMap extends BaseBlockMap> = { [K in keyof BlockMap]: ReturnType<BlockMap[K]> }

type BaseThyFunction = (key: string) => unknown
// type PartialThyFunction<BlockExports extends Record<string, unknown>, Keys extends (string & keyof BlockExports)> = <
//   OutputKey extends Keys | void = void
//   >(
//     ...[outputKey]: ThyFunctionParameters<BlockExports, OutputKey>
//   ) => ThyFunctionOutput<BlockExports, OutputKey>
// type BaseBlock<BlockExports extends Record<string, unknown>, ThyFunction extends BaseThyFunction> = (args: { thy: ThyFunction }) => void | (Record<string, unknown> & Partial<BlockExports>)
type PartialThyFunction<BlockMap extends BaseBlockMap, Keys extends (string & keyof BlockMap)> = <
  OutputKey extends Keys | void = void
  >(
    ...[outputKey]: ThyFunctionParameters<BlockMap, OutputKey>
  ) => ThyFunctionOutput<BlockMap, OutputKey>
export type ThyFunction<BlockMap extends BaseBlockMap> = PartialThyFunction<BlockMap, string & keyof BlockMap>
// type BaseBlock<BlockMap extends BaseBlockMap, ThyFunction extends BaseThyFunction> = (args: { thy: ThyFunction }) => void | (Record<string, unknown> & Partial<BlockMapReturns<BlockMap>>)
type BaseBlock<BlockMap extends BaseBlockMap> = BlockMap[keyof BlockMap] | ((args: { thy: PartialThyFunction<BlockMap, string & keyof BlockMap> }) => (undefined | void | Record<string, never>))

export function makeThy<
  // BlockExports extends Record<string, unknown>,
  BlockMap extends BaseBlockMap,
// BlocksTuple extends readonly BaseBlock<BlockExports, PartialThyFunction<BlockExports, string & keyof BlockExports>>[],
>({
  blocks,
}: {
  // blocks: readonly BaseBlock<NoInfer<BlockExports>, PartialThyFunction<BlockExports, string & keyof BlockExports>>[]
  // blocks: readonly BaseBlock<NoInfer<BlockMap>, PartialThyFunction<BlockMap, string & keyof BlockMap>>[]
  blocks: readonly BaseBlock<NoInfer<BlockMap>>[]
}): PartialThyFunction<BlockMap, string & keyof BlockMap> {
  const values: Record<string, unknown> = {}
  const blocksRun: unknown[] = []
  const thy = <
    OutputKey extends (string & keyof BlockMap) | void = void
  >(
    ...[outputKey]: ThyFunctionParameters<BlockMap, OutputKey>
  ): ThyFunctionOutput<BlockMap, OutputKey> => {
    for (const block of blocks) {
      if (blocksRun.includes(block)) {
        continue
      }
      blocksRun.push(block)
      const newValues = block({ thy })
      if (newValues) {
        for (const [key, value] of Object.entries(newValues)) {
          values[key] = value
        }
      }
    }
    if (outputKey) {
      return values[outputKey] as ThyFunctionOutput<BlockMap, OutputKey>
    }
    return undefined as ThyFunctionOutput<BlockMap, OutputKey>
  }
  return thy
}

// type ThyFunctionParameters<AggregateOutput extends Record<string, unknown>, OutputKey extends (string & keyof AggregateOutput) | void> = OutputKey extends void ? [] : [key: OutputKey]
// type ThyFunctionOutput<AggregateOutput extends Record<string, unknown>, OutputKey extends (string & keyof AggregateOutput) | void> = OutputKey extends void ? void : OutputKey extends keyof AggregateOutput ? AggregateOutput[OutputKey] : never
type ThyFunctionParameters<BlockMap extends BaseBlockMap, OutputKey extends (string & keyof BlockMap) | void> = OutputKey extends void ? [] : [key: OutputKey]
type ThyFunctionOutput<BlockMap extends BaseBlockMap, OutputKey extends (string & keyof BlockMap) | void> = OutputKey extends void ? void : DefiniteReturnType<BlockMap, Exclude<OutputKey, void>>

type DefiniteReturnType<BlockMap extends BaseBlockMap, OutputKey extends (string & keyof BlockMap)> = OutputKey extends keyof ReturnType<BlockMap[OutputKey]> ? ReturnType<BlockMap[OutputKey]>[OutputKey] : never
// type DefiniteReturnType<BlockMap extends BaseBlockMap, OutputKey extends unknown> = OutputKey extends keyof BlockMap ? OutputKey extends keyof ReturnType<BlockMap[OutputKey]> ? ReturnType<BlockMap[OutputKey]>[OutputKey] : never : never

type NoInfer<T> = [T][T extends T ? 0 : never]
