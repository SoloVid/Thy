import { generateTryButton } from "./button.ts"
import { generateCodeComparison } from "./code-comparison.ts"

export type TsThyComparisonProps = {
  ts: string
  thy: string
  playground: string
}

export async function generateTsThyComparison({
  ts,
  thy,
  playground,
}: TsThyComparisonProps) {
  const compare = await generateCodeComparison({
    source1: ts,
    language1: "typescript",
    source2: thy,
    language2: "thy",
  })
  const button = generateTryButton({
    playgroundUrl: playground,
    source: thy,
  })
  return compare + "\n" + button
}
