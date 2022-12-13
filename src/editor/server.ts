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
      case "/playground.html":
        await serve("playground.html")
        return
      case "/lib/editor-client.js":
        await serve("lib/editor-client.js")
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
