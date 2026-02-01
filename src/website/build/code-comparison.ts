import { generateCodeBlock } from "./code-block.ts"

type CodeComparisonProps = {
  source1: string
  language1: string
  source2: string
  language2: string
}

export function generateCodeComparison({
  source1,
  language1,
  source2,
  language2,
}: CodeComparisonProps) {
  return `<div class="code-comparison">
  <div class="sample">
    <div class="text-center">
      <em>${language1}</em>
    </div>
    ${generateCodeBlock({ source: source1, language: language1 })}
  </div>
  <div class="divider"></div>
  <div class="sample">
    <div class="text-center">
      <em>${language2}</em>
    </div>
    ${generateCodeBlock({ source: source2, language: language2 })}
  </div>
</div>
`
}
