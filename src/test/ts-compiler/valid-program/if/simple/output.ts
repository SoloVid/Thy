export function initThy(_global: {}) {
  const condition = true
  if (condition) {
    console.log("yay" as const)
  }

  if (condition) {
    console.log("yes" as const)
  } else {
    console.log("no" as const)
  }

  const callback = () => {
    console.log("yay" as const)
    return {
    }
  }

  // Iff both callbacks are inline
  if (condition) {
    callback()
  } else {
    callback()
  }
  const captured = condition ? callback() : callback()

  if (condition) {
    callback()
  } else {
    console.log("no" as const)
  }

  if (condition) {
    console.log("yes" as const)
  } else {
    callback()
  }

  return {
    condition,
    callback,
    captured,
  }
}
