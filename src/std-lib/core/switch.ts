
type SwitchCallback<_T> = () => _T | undefined

type SwitchControls<_T> = {
  readonly case: (compare: unknown, callback: SwitchCallback<_T>) => _T | undefined
  readonly default: (callback: SwitchCallback<_T>) => _T | undefined
}

export const switchBuiltin = <_T>(
  expression: unknown,
  implementation: (controls: SwitchControls<_T>) => _T | undefined
) => {
  let someCaseHit = false
  return implementation({
    "case": (compare, callback) => {
      if (!someCaseHit && compare === expression) {
        someCaseHit = true
        return callback()
      }
    },
    "default": (callback) => {
      if (!someCaseHit) {
        return callback()
      }
    },
  })
}
