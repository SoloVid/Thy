import { tsGenerator } from "./generate-ts.ts"
import { CodeGenTsStdLib, defaultCodeGenTsStdLib } from "./std-lib.ts"

type Options = {
  standardLibrary?: CodeGenTsStdLib
}

export function makeSingleFileTsGenerator(options: Options) {
  const stdLib = options.standardLibrary ?? defaultCodeGenTsStdLib
  const importName = stdLib.importName
  return tsGenerator(
    stdLib.specializedGenerators,
    [
      `import { makeSimpleThyExport as _makeExport } from "thy-lang/std-lib"`,
      `import { ${importName} as _${importName} } from "${stdLib.importPath}"`,
      ``,
      `export default _makeExport(_${importName}, `,
    ].join("\n"),
    `)\n`,
    false,
  )
}
