// import {parser} from "./syntax.grammar"
// import {LezerLanguage, LanguageSupport, indentNodeProp, foldNodeProp, foldInside, delimitedIndent} from "@codemirror/language"
// import {styleTags, tags as t} from "@codemirror/highlight"
import { runLexExample } from "./lex-example"

// export const EXAMPLELanguage = LezerLanguage.define({
//   parser: parser.configure({
//     props: [
//       indentNodeProp.add({
//         Application: delimitedIndent({closing: ")", align: false})
//       }),
//       foldNodeProp.add({
//         Application: foldInside
//       }),
//       styleTags({
//         Identifier: t.variableName,
//         Boolean: t.bool,
//         String: t.string,
//         LineComment: t.lineComment,
//         "( )": t.paren
//       })
//     ]
//   }),
//   languageData: {
//     commentTokens: {line: ";"}
//   }
// })

// export function EXAMPLE() {
//   return new LanguageSupport(EXAMPLELanguage)
// }

runLexExample()