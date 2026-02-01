import { LibraryGeneratorCollection } from "./library-generator.ts"
import { standardLibraryCore } from "./standard-library/core/index.ts"

export type CodeGenTsStdLib = {
  importPath: string
  importName: string
  specializedGenerators: LibraryGeneratorCollection
}

export const defaultCodeGenTsStdLib = {
  importPath: "thy-lang/std-lib",
  importName: "core",
  specializedGenerators: standardLibraryCore,
} as const satisfies CodeGenTsStdLib
