import { IRecognizerContext } from "chevrotain"
import { Parser } from "./parser"
import { ParserRules } from "./parser-rules"

// BaseVisitor constructors are accessed via a parser instance.
// const parserInstance = new Parser()

// const BaseSQLVisitor = parserInstance.getBaseCstVisitorConstructor()

// type ParserVisitorMethods = { [K in keyof Parser]: (ctx: IRecognizerContext) => unknown }

// class myCustomVisitor extends BaseSQLVisitor implements ParserRules {
//   constructor() {
//     super()
//     // The "validateVisitor" method is a helper utility which performs static analysis
//     // to detect missing or redundant visitor methods
//     this.validateVisitor()
//   }

//   /* Visit methods go here */
// }

// const myVisitorInstance = new myCustomVisitor()
// const myVisitorInstanceWithDefaults = new myCustomVisitorWithDefaults()