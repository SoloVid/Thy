import Markdown from "markdown-to-jsx"
import { TryButton } from "./button"
import CodeBlock from "./code-block"
import { playgroundBaseUrl } from "./links"

export type ThyCodeBlockProps = {
  children: { props: { class: string, children: string }}
}

export function MarkdownCodeBlockReplace(props: ThyCodeBlockProps) {
  console.log(props)
  const lang = props.children.props.class.replace('lang-', '')
  return <>
    <CodeBlock
      language={lang}
      source={props.children.props.children}
    ></CodeBlock>
    { lang === "thy" && <TryButton playgroundUrl={playgroundBaseUrl} source={props.children.props.children}></TryButton>}
  </>
}

export function ThyMarkdown({ children:source }: {children: string}) {
  return <Markdown
    options={{
      overrides: {
        pre: MarkdownCodeBlockReplace
      }
    }}
  >{source}</Markdown>
}
