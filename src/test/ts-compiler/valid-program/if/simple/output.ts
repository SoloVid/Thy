const condition = true
if (condition) {
  console.log("yay")
}

if (condition) {
  console.log("yes")
} else {
  console.log("no")
}

function callback() {
  console.log("yay")
}

// Iff both callbacks are inline
condition ? callback() : callback()

if (condition) {
  callback()
} else {
  console.log("no")
}

if (condition) {
  console.log("yes")
} else {
  callback()
}

// The following cases are errors.

if (false) {}

if (condition) {}

if (condition) {
  console.log("yes")
} else {}

if (condition) {
  console.log("yes")
} else {
  console.log("no")
}
