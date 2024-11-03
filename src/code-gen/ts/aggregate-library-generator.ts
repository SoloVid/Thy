import type { LibraryGeneratorCollection } from "./library-generator"

export function aggregateLibrary(
  libraries: readonly LibraryGeneratorCollection[],
): LibraryGeneratorCollection {
  function tryGenerateWithChildLib<T>(
    process: (lib: LibraryGeneratorCollection) => T,
  ) {
    for (const lib of libraries) {
      const output = process(lib)
      if (output) {
        return output
      }
    }
  }

  return {
    valueIdentifierGenerator(node, state, fixture) {
      return tryGenerateWithChildLib((lib) =>
        lib.valueIdentifierGenerator(node, state, fixture),
      )
    },
    typeIdentifierGenerator(node, state, fixture) {
      return tryGenerateWithChildLib((lib) =>
        lib.typeIdentifierGenerator(node, state, fixture),
      )
    },
    callGenerator(node, state, fixture) {
      return tryGenerateWithChildLib((lib) =>
        lib.callGenerator(node, state, fixture),
      )
    },
    assignmentGenerator(node, state, fixture) {
      return tryGenerateWithChildLib((lib) =>
        lib.assignmentGenerator(node, state, fixture),
      )
    },
    letCallGenerator(node, state, fixture) {
      return tryGenerateWithChildLib((lib) =>
        lib.letCallGenerator(node, state, fixture),
      )
    },
    typeCallGenerator(node, state, fixture) {
      return tryGenerateWithChildLib((lib) =>
        lib.typeCallGenerator(node, state, fixture),
      )
    },
    typeAssignmentGenerator(node, state, fixture) {
      return tryGenerateWithChildLib((lib) =>
        lib.typeAssignmentGenerator(node, state, fixture),
      )
    },
  }
}
