import type { Core } from "thy-lang/std-lib"

export function initThy(_global: Core) {
  class _exercise_TypePackage { f() {
    class _args_TypePackage { f() {
      function _Args_WrappedValue() { return (() => {
        const bar = (_msg: unknown): undefined => {
          const msg = _msg
          void "type return erased"
        }
        return {
          bar,
        }
      }) }
      type _Args_RestParams = ReturnType<typeof _Args_WrappedValue> extends (...rest: infer U) => unknown ? U : []
      function _Args_WrappedType() { return _Args_WrappedValue()(...([] as unknown[] as _Args_RestParams)) }
      const Args = undefined as unknown as ReturnType<typeof _Args_WrappedType>
      return Args
    } }
    function _1_WrappedType() { return (_args: ReturnType<_args_TypePackage["f"]>): undefined => {
      function _Args_WrappedValue() { return (() => {
        const bar = (_msg: unknown): undefined => {
          const msg = _msg
          void "type return erased"
        }
        return {
          bar,
        }
      }) }
      type _Args_RestParams = ReturnType<typeof _Args_WrappedValue> extends (...rest: infer U) => unknown ? U : []
      function _Args_WrappedType() { return _Args_WrappedValue()(...([] as unknown[] as _Args_RestParams)) }
      const Args = undefined as unknown as ReturnType<typeof _Args_WrappedType>
      const args = _args
      void "type return erased"
    } }
    const ExerciseFunc = undefined as unknown as ReturnType<typeof _1_WrappedType>
    return ExerciseFunc
  } }
  const foo = (_exercise: ReturnType<_exercise_TypePackage["f"]>) => {
    class _args_TypePackage { f() {
      function _Args_WrappedValue() { return (() => {
        const bar = (_msg: unknown): undefined => {
          const msg = _msg
          void "type return erased"
        }
        return {
          bar,
        }
      }) }
      type _Args_RestParams = ReturnType<typeof _Args_WrappedValue> extends (...rest: infer U) => unknown ? U : []
      function _Args_WrappedType() { return _Args_WrappedValue()(...([] as unknown[] as _Args_RestParams)) }
      const Args = undefined as unknown as ReturnType<typeof _Args_WrappedType>
      return Args
    } }
    function _1_WrappedType() { return (_args: ReturnType<_args_TypePackage["f"]>): undefined => {
      function _Args_WrappedValue() { return (() => {
        const bar = (_msg: unknown): undefined => {
          const msg = _msg
          void "type return erased"
        }
        return {
          bar,
        }
      }) }
      type _Args_RestParams = ReturnType<typeof _Args_WrappedValue> extends (...rest: infer U) => unknown ? U : []
      function _Args_WrappedType() { return _Args_WrappedValue()(...([] as unknown[] as _Args_RestParams)) }
      const Args = undefined as unknown as ReturnType<typeof _Args_WrappedType>
      const args = _args
      void "type return erased"
    } }
    const ExerciseFunc = undefined as unknown as ReturnType<typeof _1_WrappedType>
    const exercise = _exercise
    const o = ((_2L = {} as never) => {
      const _2 = { ..._2L as (typeof _2L extends never ? {} : typeof _2L), ..._global } as const
      const bar = _2.print
      return {
        bar,
      }
    })()
    exercise(o)
  }

  // Above we can just accept as generated.
  // Below is what we really care about in this test.

  foo((_6L = {} as never) => {
    const _6 = { ..._6L as (typeof _6L extends never ? {} : typeof _6L), ..._global } as const
    foo((_5L = {} as never) => {
      const _5 = { ..._5L as (typeof _5L extends never ? {} : typeof _5L), ..._6 } as const
      if (true) {
        foo((_4L = {} as never) => {
          const _4 = { ..._4L as (typeof _4L extends never ? {} : typeof _4L), ..._5 } as const
          foo((_3L = {} as never) => {
            const _3 = { ..._3L as (typeof _3L extends never ? {} : typeof _3L), ..._4 } as const
            _3.bar("himom" as const)
          })
        })
        foo(() => {
          console.log("himom" as const)
        })
      }
    })
  })

  foo((_8L = {} as never) => {
    const _8 = { ..._8L as (typeof _8L extends never ? {} : typeof _8L), ..._global } as const
    foo((_7L = {} as never) => {
      const _7 = { ..._7L as (typeof _7L extends never ? {} : typeof _7L), ..._8 } as const
      _7.bar("himom" as const)
      foo(() => {
        console.log("himom" as const)
      })
    })
  })
}
