import { SourceCodeWorkspace, SourceCodeWorkspaceNode } from "editor/file/in-memory-files"
import {
  compressToEncodedURIComponent as compressLz,
  decompressFromEncodedURIComponent as decompressLz,
} from "lz-string"
import { SerializedWorkspace } from "./serialized-workspace"

const workspaceParam = "w"

function getUrlHashParam(param: string): string | null {
  const regex = new RegExp(`${param}=([^&]+)`)
  const paramUrlMatch =  regex.exec(window.location.hash)
  if (paramUrlMatch !== null) {
    return paramUrlMatch[1]
  }
  return null
}

export function extractCodeFromSimpleUrl(): string | null {
  const b64 = getUrlHashParam("b64")
  if (b64 !== null) {
    return atob(b64)
  }
  const lz = getUrlHashParam("lz")
  if (lz !== null) {
    return decompressLz(lz)
  }
  return null
}

export function makeWorkspaceFromScript(sourceCode: string): SerializedWorkspace {
  return {
    kind: "directory",
    name: "/",
    path: "/",
    children: [
      {
        kind: "file",
        name: "main.thy",
        path: "/main.thy",
        contents: sourceCode,
        timeModified: new Date().getTime(),
      }
    ],
    timeModified: new Date().getTime()
  }
}

export function extractWorkspaceFromSimpleUrl(): SerializedWorkspace | null {
  const s = extractCodeFromSimpleUrl()
  if (s === null) {
    return null
  }
  return makeWorkspaceFromScript(s)
}

export function extractCodeFromUrl(): SerializedWorkspace | null {
  try {
    const w = getUrlHashParam(workspaceParam)
    if (w !== null) {
      return JSON.parse(decompressLz(w))
    }
    return extractWorkspaceFromSimpleUrl()
  } catch (e) {
    // TODO: Surface error better.
    console.error(e)
    window.alert(`Error parsing source in URL: ${e}`)
  }
  return null
}

function serializeWorkspace(workspace: SourceCodeWorkspace): SerializedWorkspace {
  return serializeWorkspaceNode(workspace)
}

function serializeWorkspaceNode<NodeType extends SourceCodeWorkspaceNode>(node: NodeType): Omit<NodeType, "parent"> {
  if (node.kind === "directory") {
    const { parent, ...everythingElse } = node
    return everythingElse
  } else {
    const { parent, ...everythingElse } = node
    return everythingElse
  }
}

export function makeShareUrl(workspace: SourceCodeWorkspace) {
  return (
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    window.location.search +
    `#${workspaceParam}=` +
    compressLz(JSON.stringify(serializeWorkspace(workspace)))
  )
}
