import { readFile } from "node:fs/promises"
import { createServer } from "node:http"
import { join } from "node:path"

export function serveFiles(directory: string, port: number) {
  const server = createServer(async (req, res) => {
    console.log("request received", req.url)
    try {
      const fileRelativePath = (req.url ?? "/").replace(/\/$/, "/index.html")
      const contents = await readFile(join(directory, fileRelativePath))
      res.writeHead(200)
      res.end(contents)
    } catch (e) {
      console.error(e)
      res.writeHead(500)
      res.end("internal server error")
    }
  })

  server.listen(port, "0.0.0.0")
  console.log(`Listening on port ${port}`)
  console.log(`http://localhost:${port}`)
}
