# Thy (Lang)

Thy is a programming language. This project implements some tools to work with it.

## Language

The most digestible documentation for Thy is in [docs/](./docs/),
with the two most important documents being
the [language spec](./docs/language-spec.md)
and [miscellaneous design notes](./docs/language-design.md).

## VSCode Development

A core aspect of this project is IDE tooling.
Right now, Thy only has meaningful support for VSCode.

The VSCode extension lives in the... (_ahem_) `vscode-extension` directory.

To use/debug the extension (and get Thy syntax highlighting in VSCode):

- Open a fresh VSCode window
- Open the `vscode-extension` directory (as the top-level project working directory in that window)
- Press F5
  - This should open up a new VSCode window with the Thy extension enabled.
- Open this project directory in that second window
  - Thy syntax highlighting should appear in `.thy` files and `.md` files.

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

Run sandbox logic (after building):

```
npm start
```

Try out compiler (after building):

```
node lib/api/cli.js -t ts-namespace -r src -o dist
```
