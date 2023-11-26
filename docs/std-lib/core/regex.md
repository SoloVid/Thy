```thy
type InputPattern is Union String RegExp
pattern is given InputPattern
flags is given String ""

type return RegExp
```

Create a regular expression object
(implemented with [JavaScript's RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp))
for matching string patterns.

**Example:**

```thy
source is def "some source text"
re is regex "sour.+\\b"
source.replace re "target"
Print "some target text"
print that
```
