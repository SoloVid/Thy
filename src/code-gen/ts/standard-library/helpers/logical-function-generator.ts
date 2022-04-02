import { tokenError } from "../../../../compile-error";
import { nodeError } from "../../../../tree/tree-node";
import { fromComplicated, fromToken, GeneratedSnippets } from "../../../generator";
import { GeneratorForGlobalSpec } from "../../../generator-for-global";
import { contextType } from "../../../generator-state";
import { autoTight, autoTightS } from "./auto-tight";

export function makeLogicalFunctionGenerator(name: string, jsOperator: string, defaultValue: string): GeneratorForGlobalSpec {
    return {
        name: name,
        generateValue(state) {
            const expression = ['_a', ...['_b', '_c', '_d'].map(e => `(${e} ?? ${defaultValue})`)].join(` ${jsOperator} `);
            return autoTightS(state, `(_a: boolean, _b?: boolean, _c?: boolean, _d?: boolean) => ${expression}`);
        },
        generateCall(node, state, fixture) {
            if (node.args.length < 1) {
                state.addError(tokenError(node.func.target, `${name} requires at least 1 argument`));
                return fromComplicated(node, ["false"]);
            }
            for (const arg of node.args.slice(4)) {
                state.addError(nodeError(arg, `${name} only supports up to 4 arguments`));
            }
            const childState = state.makeChild({ context: contextType.isolatedExpression });
            const generatedChildren = node.args.map(a => fixture.generate(a, childState))
            const separatedChildren = generatedChildren.map((c, i) => {
                if (i === 0) {
                    return c
                }
                return [fromToken(node.func.target, ` ${jsOperator} `), c]
            })
            return fromComplicated(node, autoTight(state, separatedChildren));
        }
    };
}

export function makeSequencedLogicalFunctionGenerator(name: string, jsOperator: string, constraint: string, fillIn: string): GeneratorForGlobalSpec {
    return {
        name: name,
        generateValue(state) {
            const params = ['_a', '_b', '_c', '_d']
            const pairedOff = params.slice(1).map((b, i) => {
                const a = params[i]
                return ['(', a, ` ${jsOperator} `, b, ')']
            })
            const expression = pairedOff.filter(a => a.length > 0).map(a => a.join("")).join(" && ")
            return autoTightS(state, `<_T extends ${constraint}>(_a: _T, _b: _T, _c: _T = _b${fillIn}, _d: _T = _c${fillIn}) => ${expression}`);
        },
        generateCall(node, state, fixture) {
            if (node.args.length < 2) {
                state.addError(tokenError(node.func.target, `${name} requires at least 2 arguments`));
                return fromComplicated(node, ["false"]);
            }
            for (const arg of node.args.slice(4)) {
                state.addError(nodeError(arg, `${name} only supports up to 4 arguments`));
            }
            const childState = state.makeChild({ context: contextType.isolatedExpression });
            const pairedOff = node.args.slice(1).map((b, i) => {
                const a = node.args[i]
                return fromComplicated(node, [
                    '(',
                    fixture.generate(a, childState),
                    ` ${jsOperator} `,
                    fixture.generate(b, childState),
                    ')'
                ])
            })
            const separatedPairs = pairedOff.map((p, i) => {
                if (i === 0) {
                    return p
                }
                return [fromToken(node.func.target, ` && `), p]
            })
            return fromComplicated(node, autoTight(state, separatedPairs));
        }
    };
}
