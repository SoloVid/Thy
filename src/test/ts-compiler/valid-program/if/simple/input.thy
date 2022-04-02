condition is def true
if condition
  console.log "yay"

if condition
  console.log "yes"
and else
  console.log "no"

callback is def
  console.log "yay"

Iff both callbacks are inline
if condition callback else callback
captured is if condition callback else callback

if condition callback else
  console.log "no"

if condition
  console.log "yes"
and else callback

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
