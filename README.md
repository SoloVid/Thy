# Thy (Lang)

Thy is a programming language. This project implements some tools to work with it.

Check out the [`docs/` directory](./docs/) for documentation about the language itself.
The rest of this README will be focused on the code/tooling in this repository.

## Repository Structure

- `bin/` - entrypoints for CLI
- `docs/` - end-user documentation for Thy
- `public/` - (partially dynamic) directory out of which website is served
- `src/`
  - `api/` - stuff to be exposed in the npm package
  - `code-gen/` - code generation (syntax tree to TypeScript output)
  - `editor/` - [playground](#playground) for editing/running Thy in the browser
  - `example/` - example Thy code snippets for documentation and testing
  - `home/` - [website](#website)
  - `interpreter/` - runtime interpreter for Thy
  - `parser/` - Thy parser (tokens to syntax tree)
  - `std-lib/` - implementations of Thy standard library functions
  - `tokenizer/` - Thy tokenizer (Thy source to tokens)
  - `tree/` - types for syntax tree
- `vscode-extension/` - [VS Code extension](#vscode-extension)

## Compiler/Tools

This repository implements a compiler for Thy as well as some supporting tools
like an interpreter.

## Compiler/Tools Development

This project is built on [Node.js](https://nodejs.org/en/).
Make sure it is installed on your system before proceeding.

Install dependencies for the project:

```
npm ci
```

Build the project:

```
npm run build
```

> Note: All of these test scenarios are very much works-in-progress.
> Any number of error messages may appear running these commands.

Run tests (after building):

```
npm test
```

Try out compiler (after building):

```
node lib/api/cli.js -t ts-namespace -r src -o dist
```

## Website

This repository also builds the website that is hosted at [thy.dev](https://thy.dev).

To run the website:

```sh
npm run site:dev
```

To build the website (for static hosting):

```sh
npm run site:build
```

### Playground

A critical piece of the website is the interactive Thy playground,
which allows users to write Thy code in the browser and run it there.
This part of the website is effectively an entirely separate application
that heavily leverages the interpreter implementation.

[src/editor/playground.tsx](./src/editor/playground.tsx) is the primary entrypoint file for this.

## VSCode Extension

A core aspect of this project is IDE tooling.
Right now, Thy only has meaningful support for VSCode.

The VSCode extension lives in the... (_ahem_) `vscode-extension` directory.

The only thing the extension currently provides is syntax highlighting for Thy.

## VSCode Extension Development

To use/debug the extension (and get Thy syntax highlighting in VSCode):

- Open a fresh VSCode window
- Open the `vscode-extension` directory (as the top-level project working directory in that window)
- Press F5
  - This should open up a new VSCode window with the Thy extension enabled.
- Open this project directory in that second window
  - Thy syntax highlighting should appear in `.thy` files and `.md` files.
