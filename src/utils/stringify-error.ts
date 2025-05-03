export function stringifyError(error: unknown): string {
  if (typeof error === "string") {
    return error
  }
  if (error instanceof Error) {
    return error.message
  }
  return JSON.stringify(error)
}
