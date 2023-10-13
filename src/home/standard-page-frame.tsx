import "preact/debug"

import { ComponentChild, render } from "preact"
import { useEffect } from "preact/hooks"
import { home } from "./links"

type StandardPageFrameProps = {
  children: ComponentChild
  title: string
}

export default function StandardPageFrame({ title, children }: StandardPageFrameProps) {
  useEffect(() => {
    document.title = title
  }, [])
  return <div class="background">
    <div class="column-content-sm">
      <a href={home}><h1 class="text-center">Thy (lang)</h1></a>
      <h4 class="text-center">
        <em>My language is thy language</em>
      </h4>
    </div>
    {children}
  </div>
}

export function renderStandardPage(title: string, content: ComponentChild) {
  const page = <StandardPageFrame title={title}>
  {content}
</StandardPageFrame>
  const attachRoot = document.getElementById('app') as HTMLElement
  render(page, attachRoot);
}
