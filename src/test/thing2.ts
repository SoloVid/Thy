import { thing } from "./my.scope"
import { b } from './my.scope.thing'

namespace my.scope {
    export const thing2 = {
        a: thing.a,
        b: true
    }
}

export const my_scope_thing2 = my.scope.thing2
