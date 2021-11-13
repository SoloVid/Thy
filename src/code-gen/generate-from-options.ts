import type { TreeNode } from '../tree/tree-node'
import type { CodeGeneratorFunc, DefiniteCodeGeneratorFunc } from './generator'

export function makeGenerator<InType extends TreeNode, SpecializedType>(
    transformNode: (node: InType) => SpecializedType | void,
    generateDefault: DefiniteCodeGeneratorFunc<SpecializedType>,
    specializations: CodeGeneratorFunc<SpecializedType>[],
): CodeGeneratorFunc<InType> {
    return (node, state) => {
        const specializedNode = transformNode(node)
        if (!specializedNode) {
            return
        }

        for (const generator of specializations) {
            const outputCode = generator(specializedNode, state)
            if (outputCode !== undefined) {
                return outputCode
            }
        }

        return generateDefault(specializedNode, state)
    }
}
