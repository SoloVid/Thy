export default function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
      throw new Error(message);
  }
}

/**
 * Do a compile-time type check of thing.
 *
 * For negation, use `@ts-expect-error`:
 * ```ts
 * // @ts-expect-error Some error message
 * assertType<TypeNotExpected>(valueWithActualType)
 * ```
 * @param thing to type-check
 */
export function assertType<T>(thing: T): void {
  // Do nothing. This is just for a compile-time type check.
}
