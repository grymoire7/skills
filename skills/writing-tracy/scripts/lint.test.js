'use strict';
const assert = require('node:assert');
const { clichePatterns, dashPatterns } = require('./lint-patterns');
const patternsById = Object.fromEntries([...clichePatterns, ...dashPatterns].map(p => [p.id, p]));

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

function expectMatches(id, sample, expectedCount, expectedCounts) {
  test(`${id} :: "${sample}"`, () => {
    const found = patternsById[id].find(sample);
    assert.strictEqual(found.length, expectedCount, `expected ${expectedCount} matches, got ${found.length}`);
    if (expectedCounts) {
      assert.deepStrictEqual(found.map(f => f.count), expectedCounts, 'chain counts mismatch');
    }
  });
}

// ---- vendored pattern cases (ported from Simon Willison's llm-cliche-highlighter.html) ----
expectMatches('no-chain', 'No sign-ups, no downloads, no hassle — just paste and go.', 1, [3]);
expectMatches('no-chain', 'There is no catch here, honestly.', 0, []);
expectMatches('no-chain', 'no-code, no-fuss setup', 1, [2]);
expectMatches('whole', "That's the whole point.", 1);
expectMatches('whole', 'The whole team showed up.', 0);
expectMatches('did-not-chain', 'Did not flinch, did not blink, did not apologize.', 1, [3]);
expectMatches('did-not-chain', 'She did not go.', 0, []);
expectMatches('dont-verb-it', "Don't call it a comeback. Call it a return.", 1);
expectMatches('dont-verb-it', "Don't overthink it.", 0);
expectMatches('sit-with', 'Sit with that for a moment.', 1);
expectMatches('sit-with', 'Come sit with us at lunch.', 0);
expectMatches('already-know', 'You already know the answer.', 1);
expectMatches('already-know', 'If you already know Python, skip ahead.', 0);
expectMatches('is-the-entire', 'Consistency is the entire game.', 1);
expectMatches('is-the-entire', 'He toured the entire factory.', 0);
expectMatches('the-entire-is', 'The entire point is that nobody reads.', 1);
expectMatches('the-entire-is', 'He ate the entire pizza.', 0);
expectMatches('is-real', "The improvement is real, and it's not subtle.", 1);
expectMatches('is-real', 'He is a real estate agent and it shows.', 0);
expectMatches('punchline', 'The punchline is that nobody laughed.', 1);
expectMatches('punchline', 'He forgot the punchline entirely.', 0);
expectMatches('worth-naming', "That loss is real and it's worth naming.", 1);
expectMatches('worth-naming', "It's not worth naming names here.", 0);
expectMatches('not-nothing', "That's not nothing.", 1);
expectMatches('not-nothing', 'There is nothing left to say.', 0);
expectMatches('not-nothing', 'That’s not nothing.', 1);

// ---- original pattern cases (not in the vendored source) ----
expectMatches('not-just-but', 'not just clear, but actionable', 1);
expectMatches('not-just-but', 'This is not just fast, but also cheap.', 1);
expectMatches('not-just-but', 'I did not go to the store.', 0);
expectMatches('not-just-but', 'Not just yet.', 0);
expectMatches('real-x-is-y', 'The real problem is that nobody tested it.', 1);
expectMatches('real-x-is-y', 'The real question here is whether it scales.', 1);
expectMatches('real-x-is-y', 'The real estate market is booming.', 0);
expectMatches('real-x-is-y', 'The real work starts tomorrow.', 0);
expectMatches('em-dash', 'The result — good or bad — surprised everyone.', 2);
expectMatches('em-dash', 'Well-known results here.', 0);
expectMatches('en-dash', 'the result – surprisingly – held up', 2);
expectMatches('en-dash', 'pages 10–12', 0);
expectMatches('en-dash', '2020–2021', 0);
expectMatches('hyphen-sep', 'fast - but fragile', 1);
expectMatches('hyphen-sep', 'well-known', 0);
expectMatches('hyphen-sep', 'follow-up', 0);

// ---- CLI function cases ----
const { lint, lineNumberAt, snippetAt } = require('./lint');

test('lineNumberAt counts newlines before the offset', () => {
  const text = 'a\nb\nc';
  assert.strictEqual(lineNumberAt(text, 0), 1);
  assert.strictEqual(lineNumberAt(text, 2), 2);
  assert.strictEqual(lineNumberAt(text, 4), 3);
});

test('snippetAt collapses whitespace and marks truncation', () => {
  const text = 'x'.repeat(50) + 'TARGET' + 'y'.repeat(50);
  const start = 50;
  const end = 56;
  const snippet = snippetAt(text, start, end);
  assert.ok(snippet.startsWith('...'), 'expected a leading ellipsis');
  assert.ok(snippet.endsWith('...'), 'expected a trailing ellipsis');
  assert.ok(snippet.includes('TARGET'), 'expected the match text to be present');
});

test('lint() catches a match spanning a line break and reports the start line', () => {
  const text = "Intro paragraph.\n\nThe fix is\nreal, and it wasn't obvious to anyone on the team.";
  const hits = lint(text);
  const hit = hits.find(h => h.id === 'is-real');
  assert.ok(hit, 'expected an is-real hit');
  assert.strictEqual(hit.line, 3, 'match should be reported on the line where it starts');
});

test('lint() sorts hits by line number', () => {
  const text = 'The real problem is X.\n\nNo fluff, no filler, no jargon.\n\nThat is not nothing.';
  const hits = lint(text);
  const lines = hits.map(h => h.line);
  const sorted = [...lines].sort((a, b) => a - b);
  assert.deepStrictEqual(lines, sorted, 'hits should already be sorted by line');
  assert.strictEqual(hits.length, 3, 'expected all three clichés to be caught');
});

test('lint() returns nothing for clean text', () => {
  const text = 'The dog ran across the yard and barked twice.';
  assert.deepStrictEqual(lint(text), []);
});

let failures = 0;
for (const t of tests) {
  try {
    t.fn();
  } catch (err) {
    failures += 1;
    console.log(`FAIL ${t.name}: ${err.message}`);
  }
}
console.log(`${tests.length - failures} passed, ${failures} failed`);
process.exitCode = failures ? 1 : 0;
