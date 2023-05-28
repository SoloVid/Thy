
export const classesTs = `
class Thing {
  private secret: string
  public open: number

  constructor(n: number) {
    this.secret = randomUuid()
    this.open = number
  }

  gibMe() {
    return this.secret
  }
}

const myThing = new Thing(5)
`

export const classesThy = `
makeThing is def
  private n is given Number
  private secret is randomUuid
  export open is def n

  export gibMe is def
    return secret
type Thing is makeThing

myThing is makeThing 5
`

export const classesTs2 = `
const makeThing = (n: number) => {
  const secret = randomUuid()
  return {
    open: n,
    gibMe: () => {
      return secret
    }
  }
}

const myThing = makeThing(5)
`

export const classesThy2 = `
makeThing is def
  n is given Number
  secret is randomUuid
  let
    open is def n
    gibMe is def
      return secret

myThing is makeThing 5
`
