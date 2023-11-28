import { ThyMarkdown } from "./markdown-code-block-replace"

export function makeMultiMarkdown(sections: readonly (readonly [name: string, markdown: string, id?: string])[]) {

  function nameAsId(name: string, id: string | undefined) {
    if (id) {
      return id
    }
    return name.replace(/[A-Z]+/g, (m) => `-${m.toLowerCase()}`).replace(/[^a-z]/g, "-")
  }
  
  const toc = sections.map(([name,,id]) => <>
    <li><a href={`#${nameAsId(name, id)}`}>{name}</a></li>
  </>)
  
  const renderedSections = sections.map(([name, doc, id]) => <>
    <hr/>
    <a href={`#${nameAsId(name, id)}`}>
      <h3 id={nameAsId(name, id)}>{name}</h3>
    </a>
    <ThyMarkdown noTry>{doc}</ThyMarkdown>
    <em><a href="#top">back to top</a></em>
  </>)

  return { toc, renderedSections }
}
