/**
 * Prevents inference by wrapping a type parameter in a conditional type.
 * Note that it won't help when the other position is always inferred after
 * e.g. `(x: NoInfer<T>) => T`
 */
export type NoInfer<T> = [T][T extends T ? 0 : never]

export type DebugNever<Message> = [never, Message]
export type DebugNeverWithData<Message extends string, T extends unknown> = [never, Message, T]

export type DefaultNever<T, Default> = [T] extends [never] ? Default : T

// https://gist.github.com/webstrand/b6c8a1bb019f156a3b2b0e553370b18d
export type Expand<T> = T extends string | number | boolean | bigint | null | void | symbol | Function | Date ? T : { [K in keyof T]: T[K] }
// export type Expand<T> = T extends unknown ? T extends Function ? T : { [K in keyof T]: Expand<T[K]> } : never
