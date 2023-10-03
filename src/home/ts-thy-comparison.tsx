import { TryButton } from "./button"
import CodeComparison from "./code-comparison"

export type TsThyComparisonProps = {
  ts: string
  thy: string
  playground: string
}

export default function TsThyComparison({
  ts,
  thy,
  playground,
}: TsThyComparisonProps) {
  return <>
    <CodeComparison
      source1={ts}
      language1="typescript"
      source2={thy}
      language2="thy"
    ></CodeComparison>
    <TryButton playgroundUrl={playground} source={thy.trim()}></TryButton>
  </>
}
