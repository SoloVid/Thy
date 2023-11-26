import Markdown from "markdown-to-jsx"
import { TryButton } from "./button"
import CodeBlock from "./code-block"
import { playgroundBaseUrl } from "./links"

export type ThyCodeBlockProps = {
  children: { props: { class: string, children: string }}
}

export function makeMarkdownCodeBlockReplace(addTryLinks: boolean) {
  return (props: ThyCodeBlockProps) => {
    const lang = props.children.props.class.replace('lang-', '')
    return <>
      <CodeBlock
        language={lang}
        source={props.children.props.children}
      ></CodeBlock>
      { lang === "thy" && addTryLinks && <TryButton playgroundUrl={playgroundBaseUrl} source={props.children.props.children}></TryButton>}
    </>
  }
}

export type ThyMarkdownProps = {
  children: string
  noTry?: boolean
}

export function ThyMarkdown({ children:source, noTry }: ThyMarkdownProps) {
  return <Markdown
    options={{
      overrides: {
        pre: makeMarkdownCodeBlockReplace(!noTry)
      }
    }}
  >{source}</Markdown>
}
