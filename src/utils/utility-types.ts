/**
 * Prevents inference by wrapping a type parameter in a conditional type.
 * Note that it won't help when the other position is always inferred after
 * e.g. `(x: NoInfer<T>) => T`
 */
export type NoInfer<T> = [T][T extends T ? 0 : never]

export type DebugNever<Message extends string, T extends unknown> = [never, Message, T]
