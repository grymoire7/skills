'use strict';
const assert = require('node:assert');
const { clichePatterns } = require('./lint-patterns');

const patternsById = Object.fromEntries(clichePatterns.map(p => [p.id, p]));

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
