import assert from "utils/assert"

const navBar = document.getElementById("navigation-bar")
let navBarUp: boolean = false
function toggleNavBar(show: boolean = !navBarUp) {
  assert(!!navBar, "Navigation bar element not found")
  navBarUp = show
  if (navBarUp) {
    navBar.className = "open"
  } else {
    navBar.className = ""
  }
}

const contentElement = document.getElementById("content")
contentElement?.addEventListener("click", () => toggleNavBar(false))

const hamburger = document.createElement("div")
hamburger.className = "hamburger"
hamburger.addEventListener("click", () => toggleNavBar())
navBar?.after(hamburger)
