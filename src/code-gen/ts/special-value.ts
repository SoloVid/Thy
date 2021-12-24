import type { Assignment } from "../../tree/assignment";
import type { Call } from "../../tree/call";
import type { LetCall } from "../../tree/let-call";
import type { CodeGeneratorFunc, GeneratedSnippets } from "../generator";

export interface SpecialValue {
    thyName: string
    value: GeneratedSnippets
    generateCallTs?: CodeGeneratorFunc<Call>
    generateAssignmentTs?: CodeGeneratorFunc<Assignment>
    generateLetTs?: CodeGeneratorFunc<LetCall>
}