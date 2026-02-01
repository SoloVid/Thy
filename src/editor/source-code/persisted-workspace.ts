import { extractCodeFromHistoryState } from "./history.ts"
import {
  makeWorkspaceFromScript,
  SerializedWorkspace,
} from "../file/serialized-workspace.ts"
import { extractWorkspaceFromUrl } from "./share-url.ts"

export function getPersistedWorkspace(): SerializedWorkspace {
  const workspaceFromUrl = extractWorkspaceFromUrl()
  if (workspaceFromUrl) {
    return workspaceFromUrl
  }
  const sourceFromHistory = extractCodeFromHistoryState()
  if (sourceFromHistory) {
    return sourceFromHistory
  }
  return makeWorkspaceFromScript()
}
