import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join, posix } from "node:path"
import { getPageInputs, pageOutputDir } from "./page-file-paths"

export async function generateHtml() {
  const pageInputs = await getPageInputs()
  await Promise.all(pageInputs.map(async (f) => {
    const targetPath = join(pageOutputDir, f.replace(/\.tsx?$/, ".html"))
    await mkdir(dirname(targetPath), { recursive: true })
    await writeFile(targetPath, makeHtml(f))
  }))
}

function makeHtml(inputScript: string) {
  const outputScript = posix.normalize(inputScript.replace(/\.tsx?$/, ".js"))
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Thy (lang)</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,400;1,300&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/prism-theme.css">
    <link rel="stylesheet" href="/home.css">
    <link rel="stylesheet" href="/code-input.css">
    <style>
      *:not(code *, code, .line-numbers *) {
        font-family: 'Josefin Sans', sans-serif;
      }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script src="/${outputScript}"></script>
  </body>
</html>
`
}
