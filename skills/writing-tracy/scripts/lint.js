#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const { clichePatterns, dashPatterns } = require('./lint-patterns');

const CONTEXT_CHARS = 30;

function readInput(argv) {
  const arg = argv[2];
  if (arg) return fs.readFileSync(arg, 'utf8');
  return fs.readFileSync(0, 'utf8');
}

function lineNumberAt(text, offset) {
  let line = 1;
  for (let i = 0; i < offset; i += 1) {
    if (text[i] === '\n') line += 1;
  }
  return line;
}

function snippetAt(text, start, end) {
  const s = Math.max(0, start - CONTEXT_CHARS);
  const e = Math.min(text.length, end + CONTEXT_CHARS);
  const raw = text.slice(s, e).replace(/\s+/g, ' ').trim();
  return (s > 0 ? '...' : '') + raw + (e < text.length ? '...' : '');
}

function lint(text) {
  const hits = [];
  for (const pattern of [...clichePatterns, ...dashPatterns]) {
    for (const match of pattern.find(text)) {
      hits.push({
        id: pattern.id,
        line: lineNumberAt(text, match.start),
        count: match.count,
        snippet: snippetAt(text, match.start, match.end)
      });
    }
  }
  hits.sort((a, b) => a.line - b.line);
  return hits;
}

function main(argv) {
  const text = readInput(argv);
  const hits = lint(text);
  for (const hit of hits) {
    const label = hit.count ? `${hit.id} x${hit.count}` : hit.id;
    console.log(`line ${hit.line}: [${label}] "${hit.snippet}"`);
  }
  console.log(`${hits.length} hit${hits.length === 1 ? '' : 's'}`);
  process.exitCode = hits.length ? 1 : 0;
}

if (require.main === module) {
  main(process.argv);
}

module.exports = { lint, lineNumberAt, snippetAt };
