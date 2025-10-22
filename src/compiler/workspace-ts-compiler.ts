import { tsGenerator } from "code-gen/ts/generate-ts"
import { CodeGenTsStdLib, defaultCodeGenTsStdLib } from "code-gen/ts/std-lib"
import { parseAll } from "./parse-workspace"
import { makeNodeFileBrowser } from "utils/fs/node-fs-file-browse"
import { writeFile } from "node:fs/promises"
import { dirname, join, relative } from "node:path"
import pathPosix from "node:path/posix"

type Options = {
  entrypoint: string
  inputDirectory: string
  outputDirectory: string
  standardLibrary?: CodeGenTsStdLib
}

// TODO: Propagate errors.
export async function compileWorkspaceTs(options: Options) {
  const stdLib = options.standardLibrary ?? defaultCodeGenTsStdLib
  const importName = stdLib.importName
  const inputFileBrowser = makeNodeFileBrowser(options.inputDirectory)
  const parseResultMap = await parseAll(inputFileBrowser, options.entrypoint)
  await Promise.all(
    [...parseResultMap.entries()].map(([name, parseResult]) => {
      const generator = tsGenerator(
        stdLib.specializedGenerators,
        [
          `import { makeThyExport as _makeExport } from "thy-lang/std-lib"`,
          `import { ${importName} as _${importName} } from "${stdLib.importPath}"`,
          ...Object.values(parseResult.references)
            .map((dependencies) =>
              dependencies.map(
                (dep) =>
                  `import ${dep.suggestedName} from "./${relative(dirname(join(options.inputDirectory, name)), join(options.inputDirectory, dep.id))}"`,
              ),
            )
            .flat(),
          ``,
          `const _depMap = {`,
          ...Object.entries(parseResult.references).map(
            ([pattern, dependencies]) =>
              [
                `  "${pattern}": [`,
                ...dependencies.map((dep) =>
                  [
                    `    {`,
                    `      id: "${dep.id}",`,
                    `      init: ${dep.suggestedName},`,
                    `    },`,
                  ].join("\n"),
                ),
                `  ],`,
              ].join("\n"),
          ),
          `} as const`,
          ``,
          `export default _makeExport(_${importName}, _depMap, `,
        ].join("\n"),
        `)\n`,
        false,
      )
      const generatorResult = generator(parseResult.tree)
      const outputFile = join(options.outputDirectory, `${name}.ts`)
      return writeFile(outputFile, generatorResult.output)
    }),
  )
}
