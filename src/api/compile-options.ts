export interface CompileOptions {
    /**
     * Output format from compiler.
     */
    target: 'ts-namespace'

    /**
     * Input source root directory.
     * All compiled source should be within this directory.
     * Output file structure will be dictated by relative paths from this directory.
     */
    rootDir: string

    /**
     * Output compiled source root directory.
     * Input source files will be mapped to the same relative paths
     * in this directory as originally relative to {@link rootDir}.
     */
    outDir: string

    /**
     * [Glob](https://www.npmjs.com/package/glob) patterns describing source files to compile.
     * Defaults to all .thy files in {@link rootDir}.
     */
    srcPatterns?: readonly string[]
}
