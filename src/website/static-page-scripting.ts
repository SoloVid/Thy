import assert from "utils/assert.ts"

const navBar = document.getElementById("navigation-bar")
let navBarUp: boolean = false
function toggleNavBar(show: boolean = !navBarUp) {
  assert(!!navBar, "Navigation bar element not found")
  navBarUp = show
  if (navBarUp) {
    navBar.className = "open"
    hamburger.innerText = "✖"
  } else {
    navBar.className = ""
    hamburger.innerText = "☰"
  }
}

const contentElement = document.getElementById("content")
contentElement?.addEventListener("click", () => toggleNavBar(false))

const hamburger = document.createElement("div")
hamburger.innerText = "☰"
hamburger.className = "hamburger"
hamburger.addEventListener("click", () => toggleNavBar())
navBar?.after(hamburger)

document.addEventListener("click", (e) => {
  if (!e.target) return
  const a = (e.target as Element).closest('a[href^="#"]')
  if (!a) return
  const href = a.getAttribute("href")
  if (!href || !href.startsWith("#")) return
  const id = href.slice(1)
  const el = document.getElementById(id)
  if (el) {
    e.preventDefault()
    el.scrollIntoView({ behavior: "smooth" })
    history.pushState(null, "", "#" + id)
  }
})

globalThis.addEventListener("load", () => {
  if (!location.hash.startsWith("#")) return
  const id = location.hash.slice(1)
  if (id) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "instant" })
  }
})
