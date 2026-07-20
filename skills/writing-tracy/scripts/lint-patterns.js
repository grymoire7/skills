// ==== vendored start ====
// Adapted from https://github.com/simonw/tools/blob/main/llm-cliche-highlighter.html
// Apache-2.0. Vendored 2026-07-19.
// Changes from source: extracted from HTML into a standalone CommonJS module; kept `id` and
// `find`, dropped the UI-only `name`/`description`/`badge`/`badgeTitle` fields (not needed for
// CLI output). No pattern-matching regex text was altered. The "original" section below adds
// patterns not present in the source file.

const CHAIN_BODY = String.raw`[^,.;:!?\n–—…]*`;
const CHAIN_SEP = String.raw`(?:\s*,\s*(?:and\s+|or\s+)?|\s+(?:and|or)\s+|\s*[;&–—]\s*(?:and\s+|or\s+)?|\s+-{1,2}\s+)`;
const CHAIN_SPLIT = new RegExp(CHAIN_SEP, 'i');

function makeChainFinder(head, headTest, itemLabel) {
  const item = head + CHAIN_BODY;
  const chain = new RegExp(String.raw`\b${item}(?:${CHAIN_SEP}${item})+`, 'gi');
  return function (text) {
    const found = [];
    for (const m of text.matchAll(chain)) {
      let end = m.index + m[0].length;
      while (end > m.index && /\s/.test(text[end - 1])) end -= 1;
      const count = m[0].split(CHAIN_SPLIT).filter(p => headTest.test(p.trim())).length;
      found.push({ start: m.index, end, count });
    }
    return found;
  };
}

function makeRegexFinder(re) {
  return function (text) {
    const found = [];
    for (const m of text.matchAll(re)) {
      found.push({ start: m.index, end: m.index + m[0].length });
    }
    return found;
  };
}

const clichePatterns = [
  {
    id: 'no-chain',
    find: makeChainFinder(String.raw`no[-\s]`, /^no[-\s]/i, 'no item')
  },
  {
    id: 'whole',
    find: makeRegexFinder(/\b(?:that|this)(?:['’]s|\s+(?:is|was))\s+the\s+whole\b(?:\s+\w+)?/gi)
  },
  {
    id: 'did-not-chain',
    find: makeChainFinder(String.raw`(?:did\s+not|didn['’]t)\s`, /^(?:did\s+not|didn['’]t)\s/i, 'did not item')
  },
  {
    id: 'dont-verb-it',
    find: makeRegexFinder(/\b(?:do\s+not|don['’]t)\s+(?:just\s+|simply\s+|merely\s+)?(\w+)(?:\s+(?:of|about|at|on|for|with|to))?\s+it\b[^.!?\n]*?[.!?;,:–—]['"”’]*\s*(?:just\s+|simply\s+|merely\s+)?\1(?:\s+(?:of|about|at|on|for|with|to))?\s+it\b/gi)
  },
  {
    id: 'sit-with',
    find: makeRegexFinder(/\bsit(?:s|ting)?\s+with\s+(?:that|this|it|(?:the|your)\s+(?:discomfort|feelings?|tension|weight|uncertainty|ambiguity|grief|silence|unease))\b(?:\s+for\s+a\s+\w+)?/gi)
  },
  {
    id: 'already-know',
    find: makeRegexFinder(/\byou\s+already\s+knows?\s+(?:the\s+answer|what|how|why|this|that|it|who|where)\b|\byou\s+already\s+knows?\b(?![ \t]+\w)/gi)
  },
  {
    id: 'is-the-entire',
    find: makeRegexFinder(/(?:\b(?:is|was|are|were)|['’]s)\s+the\s+entire\b(?:\s+\w+)?/gi)
  },
  {
    id: 'the-entire-is',
    find: makeRegexFinder(/\bthe\s+entire\s+[\w'’-]+(?:\s+[\w'’-]+){0,4}?\s+(?:is|was|are|were)\b/gi)
  },
  {
    id: 'is-real',
    find: makeRegexFinder(/\bis\s+(?:(?:the|a)\s+real\b(?![\s-]+(?:estate|time|life|world|quick)\b)[^.!?\n]*?\b(?:and|not)\s+it\b|real\b(?![\s-]+(?:estate|time|life|world|quick)\b)[^.!?\n]*?\b(?:and|not)\b)/gi)
  },
  {
    id: 'punchline',
    find: makeRegexFinder(/\bthe\s+punchline(?:\s+(?:is|was|being)\b|\s*[:?])/gi)
  },
  {
    id: 'worth-naming',
    find: makeRegexFinder(/(?:\b(?:is|are|was|were|feels?|felt|seems?|seemed)|['’]s)\s+(?:\w+\s+){0,2}?worth\s+naming\b(?!\s+names\b)|\bworth\s+naming\s*:/gi)
  },
  {
    id: 'not-nothing',
    find: makeRegexFinder(/\b(?:that|this|it|which)(?:['’]s|\s+(?:is|was))\s+not\s+nothing\b/gi)
  }
];
// ==== vendored end ====

// ==== original start ====
// Tracy's own additions, not present in the vendored source above.

clichePatterns.push(
  {
    id: 'not-just-but',
    find: makeRegexFinder(/\bnot\s+(?:just|only|merely|simply)\s+[^.!?\n]{1,60}?\bbut\s+(?:also\s+|even\s+)?/gi)
  },
  {
    id: 'real-x-is-y',
    find: makeRegexFinder(/\bthe\s+real\b(?![\s-]+(?:estate|time|life|world|quick)\b)\s+[\w'-]+(?:\s+[\w'-]+){0,3}\s+(?:is|was|are|were)\b/gi)
  }
);

const dashPatterns = [
  {
    id: 'em-dash',
    find: makeRegexFinder(/—/g)
  },
  {
    id: 'en-dash',
    find: makeRegexFinder(/(?<!\d)–|–(?!\d)/g)
  },
  {
    id: 'hyphen-sep',
    // \s matches newlines, so without the lookbehind this also fires on
    // markdown list markers ("...end of paragraph.\n\n- item") since the
    // blank line before the "-" satisfies \s. Exclude any "-" that's a
    // list marker: one where only horizontal whitespace precedes it since
    // the start of its line.
    find: makeRegexFinder(/\s(?<!^[ \t]*)-\s/gm)
  }
];
// ==== original end ====

module.exports = { clichePatterns, dashPatterns, makeChainFinder, makeRegexFinder };
