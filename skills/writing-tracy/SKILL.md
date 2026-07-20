---
name: writing-tracy
description: Use when writing blog posts, documentation, README content, LinkedIn posts, or any other prose meant for a human reader, before or while drafting the text
---

# Writing like Tracy

## Overview

Tracy's human-facing writing sounds like a sharp, friendly teacher explaining
something at a conference: casual expertise, not a business whitepaper, and
not an LLM. Apply these rules whenever drafting prose a person will read.

## When to use

- Blog posts, documentation, READMEs, LinkedIn posts, or similar human-facing prose.
- Not for code comments, commit messages, or internal scratch notes — those follow their own conventions.
- General guidelines only for now. If format-specific rules (blog vs. LinkedIn vs. docs) get added later, they'll live as new sections in this file or linked reference files.

## Voice and tone

- Casual expertise: a friendly, talented teacher explaining a complex topic with simple language and concrete examples.
- More like an entertaining conference talk than a business whitepaper.
- Simple, direct language. Not flowery or dramatic, but still compelling and easy to read.

## Formatting

- Sentence case for headings and subheadings ("Write code that fails fast", not "Write Code That Fails Fast").
- Code examples default to Ruby, unless the repo, the topic, or an explicit request calls for a different language.
- No em dashes or en dashes used to separate clauses (e.g. "the result — good or bad — surprised everyone"). Rewrite as two sentences, a comma, a colon, or parentheses instead.
  - This is about dash-style punctuation, not hyphenated compound words. "Well-known" and "follow-up" are fine.

## Phrases to avoid

These read as generated rather than written. Rewrite around all of them:

- "Not just X, but Y."
- Chains of two or more parallel negatives: "No fluff, no filler, no jargon." / "Didn't ask, didn't check."
- "That's the whole point / game / thing."
- "Don't call it X. Call it Y." (negate a verb, then repeat the same verb.)
- "Sit with that" / "sit with the discomfort" and similar reflective prompts.
- "You already know" standing alone or right before a full stop.
- "X is the entire point / game / business model" and its flip, "The entire point is X."
- "The real X is Y"
- "The X is real, and/not..." (real estate, real time, and similar literal uses are fine.)
- "The punchline is..."
- "It's worth naming that..." or a "Worth naming:" opener (naming names is fine).
- "That's not nothing" and its "this/it/which is not nothing" variants.

## Quick reference: before finishing a piece

1. Run `node ~/.claude/skills/writing-tracy/scripts/lint.js <file>` (or pipe the draft in via
   stdin) and fix everything it flags — it mechanically checks every phrase and dash rule above.
2. Do one more manual pass for anything the linter can't catch: tone, sentence-case headings, and
   Ruby-by-default code samples.

## Common mistakes

| Mistake | Fix |
|---|---|
| Using an em dash to bolt a clause onto a sentence | Split into two sentences, or use a comma/colon |
| Banning hyphens in compound words too | Only dash-style hyphen usage (" - " as a separator) is the target, not "well-known" |
| Writing in a formal/corporate register by default | Aim for a conference talk explaining things to a friend, not a whitepaper |
| Defaulting code examples to Python/JS without checking | Ruby is the default unless the repo or request says otherwise |
