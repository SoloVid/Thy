import type { DebugNever, DefaultNever, NoInfer } from "../utils/utility-types"

type BaseBlock = (args: { thy: ThyFunction<{}> }) => unknown
type BaseBlockMap = Record<string, BaseBlock>
type Block<BlockMap extends BaseBlockMap> = BlockMap[keyof BlockMap] | ((args: { thy: PartialThyFunction<BlockMap, (string & keyof BlockMap)> }) => (undefined | void | Record<string, never>))

type ThyFunctionParameters<BlockMap extends BaseBlockMap, OutputKey extends (string & keyof BlockMap) | void> = OutputKey extends void ? [] : [key: OutputKey]
type ThyFunctionOutput<BlockMap extends BaseBlockMap, OutputKey extends (string & keyof BlockMap) | void> = DefaultNever<
  OutputKey extends void ? void : DefiniteReturnType<BlockMap, Exclude<OutputKey, void>>,
  DebugNever<[`"${Exclude<OutputKey, void>}" is not a valid key from provider with keys`, keyof ReturnType<BlockMap[Exclude<OutputKey, void>]>]>
>
type DefiniteReturnType<BlockMap extends BaseBlockMap, OutputKey extends (string & keyof BlockMap)> = OutputKey extends keyof ReturnType<BlockMap[OutputKey]> ? ReturnType<BlockMap[OutputKey]>[OutputKey] : never
type PartialThyFunction<BlockMap extends BaseBlockMap, Keys extends (string & keyof BlockMap)> = <
  OutputKey extends Keys | void = void
  >(
    ...[outputKey]: ThyFunctionParameters<BlockMap, OutputKey>
  ) => ThyFunctionOutput<BlockMap, OutputKey>
export type ThyFunction<BlockMap extends BaseBlockMap> = PartialThyFunction<BlockMap, (string & keyof BlockMap)>

type MakeThyOptions<BlockMap extends BaseBlockMap> = {
  blocks: readonly Block<NoInfer<BlockMap>>[]
  blockMap: BlockMap
}

export function makeThyFromBlocks<
  BlockMap extends BaseBlockMap,
>({
  blocks,
  blockMap,
}: MakeThyOptions<BlockMap>): PartialThyFunction<BlockMap, (string & keyof BlockMap)> {
  const values: Record<string, unknown> = {}
  const blocksRun: unknown[] = []

  const getValue = (outputKey: string) => {
    if (!(outputKey in values)) {
      throw new Error(`"${outputKey}" not found`)
    }
    return values[outputKey]
  }

  const ensureBlockRun = (block: Block<BlockMap> | BaseBlock) => {
    if (blocksRun.includes(block)) {
      return
    }
    blocksRun.push(block)
    const newValues = block({ thy })
    if (newValues && typeof newValues === "object") {
      for (const [key, value] of Object.entries(newValues)) {
        if (key in values) {
          throw new Error(`"a" defined multiple times`)
        }
        values[key] = value
      }
    }
  }

  const thy = <
    OutputKey extends (string & keyof BlockMap) | void = void
  >(
    ...[outputKey]: ThyFunctionParameters<BlockMap, OutputKey>
  ): ThyFunctionOutput<BlockMap, OutputKey> => {
    if (outputKey) {
      if (!(outputKey in blockMap)) {
        throw new Error(`"${outputKey}" not found`)
      }
      const block = blockMap[outputKey]
      ensureBlockRun(block)
      return getValue(outputKey) as ThyFunctionOutput<BlockMap, OutputKey>
    }

    for (const block of blocks) {
      ensureBlockRun(block)
    }
    if (outputKey) {
      return getValue(outputKey) as ThyFunctionOutput<BlockMap, OutputKey>
    }
    return undefined as ThyFunctionOutput<BlockMap, OutputKey>
  }

  return thy
}
