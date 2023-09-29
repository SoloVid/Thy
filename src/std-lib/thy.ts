import type { NoInfer } from "../utils/utility-types"

type BaseBlock = (args: { thy: ThyFunction<never> }) => unknown
type BaseBlockMap = Record<string, BaseBlock>
type Block<BlockMap extends BaseBlockMap> = BlockMap[keyof BlockMap] | ((args: { thy: PartialThyFunction<BlockMap, string & keyof BlockMap> }) => (undefined | void | Record<string, never>))

type ThyFunctionParameters<BlockMap extends BaseBlockMap, OutputKey extends (string & keyof BlockMap) | void> = OutputKey extends void ? [] : [key: OutputKey]
type ThyFunctionOutput<BlockMap extends BaseBlockMap, OutputKey extends (string & keyof BlockMap) | void> = OutputKey extends void ? void : DefiniteReturnType<BlockMap, Exclude<OutputKey, void>>
type DefiniteReturnType<BlockMap extends BaseBlockMap, OutputKey extends (string & keyof BlockMap)> = OutputKey extends keyof ReturnType<BlockMap[OutputKey]> ? ReturnType<BlockMap[OutputKey]>[OutputKey] : never
type PartialThyFunction<BlockMap extends BaseBlockMap, Keys extends (string & keyof BlockMap)> = <
  OutputKey extends Keys | void = void
  >(
    ...[outputKey]: ThyFunctionParameters<BlockMap, OutputKey>
  ) => ThyFunctionOutput<BlockMap, OutputKey>
export type ThyFunction<BlockMap extends BaseBlockMap> = PartialThyFunction<BlockMap, string & keyof BlockMap>

export function makeThy<
  BlockMap extends BaseBlockMap,
>({
  blocks,
}: {
  blocks: readonly Block<NoInfer<BlockMap>>[]
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
      if (newValues && typeof newValues === "object") {
        for (const [key, value] of Object.entries(newValues)) {
          values[key] = value
        }
      }
    }
    if (outputKey) {
      if (!(outputKey in values)) {
        throw new Error(`"${outputKey}" not found`)
      }
      return values[outputKey] as ThyFunctionOutput<BlockMap, OutputKey>
    }
    return undefined as ThyFunctionOutput<BlockMap, OutputKey>
  }
  return thy
}
