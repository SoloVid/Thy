import CodeBlock from "./code-block"

type CodeComparisonProps = {
  source1: string
  language1: string
  source2: string
  language2: string
}

export default function CodeComparison({
  source1,
  language1,
  source2,
  language2,
}: CodeComparisonProps) {
  return <div class="code-comparison" style={`display:flex;flex-direction:row;`}>
    <div style="flex:0 0 47%;overflow:hidden;">
    <div class="text-center"><em>{language1}</em></div>
      <CodeBlock
        source={source1}
        language={language1}
      ></CodeBlock>
    </div>
    <div style="flex:0 0 6%;"></div>
    <div style="flex:0 0 47%;overflow:hidden;">
      <div class="text-center"><em>{language2}</em></div>
      <CodeBlock
        source={source2}
        language={language2}
      ></CodeBlock>
    </div>
  </div>
}