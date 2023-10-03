import { readFile } from "node:fs/promises"
import { createServer } from "node:http"
import { join } from "node:path"

const server = createServer(async (req, res) => {
  console.log("request received", req.url)
  try {
    async function serve(file: string) {
      const contents = await readFile(join(__dirname, "..", "..", file))
      res.writeHead(200)
      res.end(contents)
    }

    switch (req.url) {
      case "/":
      case "/playground":
      case "/playground/index.html":
        await serve("playground/index.html")
        return
      case "/code-input.css":
      case "/playground/code-input.css":
        await serve("playground/code-input.css")
        return
      case "/editor-client.js":
      case "/playground/editor-client.js":
        await serve("playground/editor-client.js")
        return
      case "/editor-client.js.map":
      case "/playground/editor-client.js.map":
        await serve("playground/editor-client.js.map")
        return
      default:
        res.writeHead(404)
        res.end(`not found: ${req.url}`)
    }
  } catch (e) {
    console.error(e)
    res.writeHead(500)
    res.end("internal server error")
  }
})

server.listen(8089, "0.0.0.0")
