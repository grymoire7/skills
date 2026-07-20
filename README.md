# skills

A personal collection of Claude Code skills, kept here so they're version-controlled instead of
living loose in a config directory.

Each skill lives under `skills/<name>/` with its own `SKILL.md`, plus a `scripts/` subdirectory
for any supporting tools the skill needs.

## Stack

Plain Node.js. Everything runs with the built-in `node` command, without a `package.json` or any
dependencies to install first.

## Setup

Symlink a skill into Claude Code's skills directory to make it available:

```bash
ln -s "$(pwd)/skills/<name>" ~/.claude/skills/<name>
```

## Tasks

Run the `writing-tracy` skill's linter against a piece of writing (see
`skills/writing-tracy/SKILL.md` for what it checks):

```bash
node skills/writing-tracy/scripts/lint.js path/to/draft.md
```

Or pipe text in instead of pointing it at a file:

```bash
pbpaste | node skills/writing-tracy/scripts/lint.js
```

Either way it prints one line per flagged phrase or dash misuse, with the line number and a
snippet of context, then a summary count. Exit code is `1` if it found anything, `0` if the text
came back clean, so it composes fine in a script or a pre-publish check.
