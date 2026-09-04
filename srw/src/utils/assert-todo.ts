/**
 * @deprecated This call represents something not yet implemented.
 */
export function assertTODO(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(`TODO: ${message}`)
  }
}
