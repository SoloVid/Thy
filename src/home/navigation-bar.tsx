import { useState } from "preact/hooks"

type Props = {
  children: any
}

export default function PageWithNavigationBar({ children }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const navBar = <div id="navigation-bar" className={isOpen ? 'open' : ''}>
    <ul className="nav">
      <li><a href="/">Home</a></li>
      <li><a href="/play/">Playground</a></li>
      <li><a href="/language-spec.html">Language Spec</a></li>
      <li>
        Guide
        <ul className="nested">
          <li><a href="/programming-101.html">Programming 101</a></li>
          <li>More to come...</li>
        </ul>
      </li>
      <li>
        Reference
        <ul className="nested">
          <li>
            Standard Library
            <ul className="nested">
              <li><a href="/api/std-lib/core.html">Core</a></li>
              <li><a href="/api/std-lib/playground.html">Playground</a></li>
            </ul>
          </li>
        </ul>
      </li>
      <li>
        Cookbook
        <ul className="nested">
          <li><a href="/vs-typescript.html">Compare to TypeScript</a></li>
          <li><a href="/algorithms.html">Example Algorithms</a></li>
        </ul>
      </li>
      <li><a href="https://github.com/SoloVid/Thy" target="_blank">Source on GitHub</a></li>
      <li><a href="https://www.codehousing.com" target="_blank">About Grant</a></li>
    </ul>
  </div>

  return <div id="navigation-page-container">
    {navBar}
    {/* <div class=""> */}
      <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        {/* <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div> */}
        { isOpen ? "✖" : "☰" }
      </div>
      <div class="content" onClick={() => setIsOpen(!isOpen)}>
        {children}
      </div>
    {/* </div> */}
  </div>
}
