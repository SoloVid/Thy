myFun is
  condition is def true
  if condition
    console.log "hi"
  if condition
    return 5
  
  let if condition
    console.log "hi"
  let if condition
    return 5

condition is def true
if condition
  console.log "yay"

if condition
  console.log "yes"
and else
  console.log "no"

callback is
  console.log "yay"

Iff both callbacks are inline
if condition callback1 else callback2

if condition callback1 else
  console.log "no"

if condition
  console.log "yes"
and else callback2

The following cases are errors.

if

if condition

if condition
  console.log "yes"
and else

if condition
  console.log "yes"
and else
  console.log "no"
and more stuff
