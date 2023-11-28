import "preact/debug"

import { ComponentChild, render } from "preact"
import { useEffect } from "preact/hooks"
import { home } from "./links"
import PageWithNavigationBar from "./navigation-bar"

type StandardPageFrameProps = {
  children: ComponentChild
  title: string
}

export default function StandardPageFrame({ title, children }: StandardPageFrameProps) {
  useEffect(() => {
    document.title = title
  }, [])
  return <PageWithNavigationBar><div class="background">
    <div class="column-content-sm">
    <h1 class="text-center"><a href={home}>Thy (lang)</a></h1>
      <h4 class="text-center">
        <em>My language is Thy language</em>
      </h4>
    </div>
    {children}
    <div class="column-content-sm">
      <p>
        <small>
          From the mind of <a href="https://www.codehousing.com" target="_blank">Grant</a>,
          source <a href="https://github.com/SoloVid/Thy" target="_blank">on GitHub</a>.
        </small>
      </p>
    </div>
  </div></PageWithNavigationBar>
}

export function renderStandardPage(title: string, content: ComponentChild) {
  const page = <StandardPageFrame title={title}>
  {content}
</StandardPageFrame>
  const attachRoot = document.getElementById('app') as HTMLElement
  render(page, attachRoot);
}
