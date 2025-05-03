import { extractCodeFromHistoryState } from "./history"
import {
  makeWorkspaceFromScript,
  SerializedWorkspace,
} from "../file/serialized-workspace"
import { extractWorkspaceFromUrl } from "./share-url"

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
