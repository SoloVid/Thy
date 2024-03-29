import type { Grammar } from "prismjs";
import Prism from "prismjs";

const innerParts: Grammar = {
  'punctuation': [
    /\./,
  ],
  'class-name': /\b[A-Z][a-zA-Z0-9]*\b/g,
  'important': [
    /\bthat\b/g,
    /\bbeforeThat\b/g,
  ],
  'number': [
    /\b-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?\b/,
  ],
}
const insideString: Grammar = {
  'string-interpolation': {
    pattern: /(\.)([a-z][a-zA-Z0-9]*)(\.)/g,
    inside: {
      'punctuation': {
        pattern: /\./g,
      },
      'variable': {
        pattern: /[a-zA-Z0-9]+/,
      }
    }
  }
}
export const thyPrismGrammar: Grammar = {
  'whitespace': [
    {
      pattern: /^\s+/,
    }
  ],
  'comment': [
    {
      pattern: /^(\s*)([A-Z]{3,})(?:.|[\n\r])+?^(\1)(\2)$/gm,
      greedy: true,
    },
    {
      pattern: /(^\s*)[A-Z].*$/gm,
      lookbehind: true,
    },
  ],
  'multiline-string-line': {
    pattern: /^(([ \t]*)[a-z].+)(""")$(?:\r?\n)(?:.|[\n\r])+?(?:^(?!(?:\2[ \t]+\S|[ \t]*$))|$(?!(?:.|[\r\n])))/gm,
    greedy: true,
    lookbehind: true,
    alias: ['string'],
    inside: insideString,
  },
  'code-line': {
    pattern: /(^\s*)[a-z].*$/gm,
    lookbehind: true,
    inside: {
      'string': [
        {
          pattern: /"(\\.|[^"])*"/g,
          greedy: true,
          inside: insideString
        }
      ],
      'keyword': [
        /\bexport\b/,
        /\bprivate\b/,
        /\btype\b/,
      ],
      'control': {
        pattern: /\b(await|return|throw)\b/,
        alias: ["keyword"],
      },
      'builtin': [
        /\bgiven\b/,
      ],
      'let-call': {
        pattern: /\blet\b.*$/,
        inside: {
          'function': {
            pattern: /(\blet )[a-z][a-zA-Z0-9]*(?=\s|$)/,
            lookbehind: true,
          },
          'control': {
            pattern: /\blet\b/,
            alias: ["keyword"],
          },
        }
      },
      'continuation': {
        pattern: /\band(?=(\s.*)?$)/,
        inside: {
          'operator': [
            /\band\b/,
          ]
        }
      },
      'assignment': {
        pattern: /.+\b(be|is|to)\b.*$/,
        inside: {
          'function': [
            {
              pattern: /(\b(?:is|be|to)\s+([a-z][a-zA-Z0-9]*\.)*)[a-z][a-zA-Z0-9]*/,
              lookbehind: true,
            },
            // {
            //   pattern: /(\b(?:is|be|to)\s+([a-zA-Z][a-zA-Z0-9]*\.)*)[A-Z][a-zA-Z0-9]*/,
            //   lookbehind: true,
            // },
          ],
          'operator': [
            /\bbe\b/,
            /\bis\b/,
            /\bto\b/,
          ],
          ...innerParts,
        },
      },
      'function': [
        {
          pattern: /(^|\.)[a-z][a-zA-Z0-9]*(?=\s|$)/,
        },
      ],
      ...innerParts,
    }
  },
}

const testInput = "Test me"
const testOutput = `<span class="token comment">Test me</span>`
export async function addThyPrismGrammarAndAwaitAvailable() {
  if (!Prism.languages.thy) {
    Prism.languages.thy = thyPrismGrammar
  } else if (Prism.languages.thy !== thyPrismGrammar) {
    throw new Error("Someone already registered a different thy language with Prism")
  }
  await new Promise<void>((resolve) => {
    const handle = setInterval(() => {
      const testHighlight = Prism.highlight(testInput, Prism.languages.thy, "thy")
      if (testHighlight === testOutput) {
        resolve()
        clearInterval(handle)
      }
    }, 500)
  })
}
