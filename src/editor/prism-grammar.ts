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
}
export const thyPrismGrammar: Grammar = {
  // 'keyword': /TS/,
  'whitespace': [
    {
      pattern: /^\s+/,
    }
  ],
  'comment': [
    // /^\s*([A-Z].*)/,
    {
      pattern: /(^\s*)[A-Z].*$/gm,
      lookbehind: true,
    },
    {
      pattern: /^(\s*)([A-Z]{3,})(?:.|[\n\r])+^(\1)(\2)$/gm,
      greedy: true,
    }
  ],
  'code-line': {
    pattern: /(^\s*)[a-z].+$/gm,
    lookbehind: true,
    inside: {
      'string': [
        {
          pattern: /"(\\.|[^"])*"/g,
          greedy: true,
        }
      ],
      'number': [
        /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/,
      ],
      'keyword': [
        /\bexport\b/,
        /\bprivate\b/,
        /\btype\b/,
        /\blet\b/,
      ],
      'builtin': [
        /\bawait\b/,
        /\bgiven\b/,
        /\breturn\b/,
        /\bthrow\b/,
      ],
      'continuation': {
        pattern: /\band(?=(\s.*)?$)/,
        inside: {
          'operator': [
            /\band\b/,
          ]
        }
      },
      'assignment': {
        pattern: /.+\b(be|is|to)\b.+$/,
        inside: {
          'function': [
            {
              pattern: /(\b(?:is|be|to)\s+([a-z][a-zA-Z0-9]*\.)*)[a-z][a-zA-Z0-9]*/,
              lookbehind: true,
            },
            {
              pattern: /(\b(?:is|be|to)\s+([a-zA-Z][a-zA-Z0-9]*\.)*)[A-Z][a-zA-Z0-9]*/,
              lookbehind: true,
            },
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
      // 'function': [
      //   {
      //     pattern: /(\b(?:is|be|to)\s+)[a-z][a-zA-Z0-9]*/,
      //   }
      // ],
    }
  },
  // 'function-call': {
  //   pattern: /(\b[a-zA-Z_][a-zA-Z0-9_]*)(?:\s+is\s+)(\b[a-zA-Z_][a-zA-Z0-9_]*)(?:\s+)(\d+)/,
  //   inside: {
  //     'function': /\b[a-zA-Z_][a-zA-Z0-9_]*\b/,
  //     'variable': /\b[a-zA-Z_][a-zA-Z0-9_]*\b/,
  //     'number': /\d+/
  //   }
  // },
  // 'important': /./,
  // Define the language token patterns
  // Example:
  // 'keyword': /\b(keyword1|keyword2|keyword3)\b/,
  // 'string': /"(?:\\.|[^\\"])*"/,
  // ... add more token patterns specific to your language
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
