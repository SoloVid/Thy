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

// The following cases are errors.

if (false) {
}

if (condition) {
}

if (condition) {
  console.log("yes" as const)
} else {
}

if (condition) {
  console.log("yes" as const)
} else {
  console.log("no" as const)
}
