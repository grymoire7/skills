---
name: writing-pitchfork-configs
description: Use when creating or updating a pitchfork.toml for a project's local dev processes (web server, asset watchers, background workers) — including auditing an existing pitchfork.toml for gaps
---

# Writing Pitchfork Configs

## Overview

Pitchfork (jdx/pitchfork) supervises long-running dev daemons. The config must
mirror what the project *actually* runs — never guess a port, a start
command, or a process count. Read the project's own process definitions and
config first; the TOML is a translation of what's already there, not a fresh
invention.

Fetch the schema before writing anything:
https://github.com/jdx/pitchfork/blob/main/docs/reference/configuration.md

## When to Use

- User asks for a `pitchfork.toml` in a repo that doesn't have one yet
- User wants pitchfork configs made consistent across several repos
- Reviewing/auditing an existing `pitchfork.toml` that seems incomplete

## Discovery Checklist (do this before writing TOML)

1. **Find existing process definitions** — `Procfile`, `Procfile.dev`,
   `bin/dev`, `docker-compose.yml`, `package.json` scripts. Each *independent*
   process in these becomes its own `[daemons.x]`. But check whether a
   process already bundles sub-processes (e.g. Phoenix's `mix phx.server`
   runs its esbuild/tailwind watchers internally via `config/dev.exs`
   `watchers:`) — don't split those back out into separate daemons.
2. **Get the real port from config**, not a guess or the framework default:
   grep `config/`, `.env`, `puma.rb`, `_config.yml`, etc. for `port`/`PORT`.
3. **Check tool-version pinning** — `.mise.toml`, `.tool-versions`,
   `.ruby-version`, `.node-version`. If present, set `mise = true` on the
   daemon so it runs under the pinned toolchain.
4. **Find a readiness signal** for HTTP daemons: an existing `/health`
   route, or just the root path. Use `ready_http`. For non-HTTP processes
   (pure file watchers, background workers with no port), there's nothing to
   poll — use `ready_delay` instead, don't fabricate a port check.
5. **Sibling-project port collisions**: if this repo runs alongside another
   one locally (e.g. an app + its separate docs site), check the other
   repo's pinned port before picking one, and pin yours in that project's
   own config (not just in pitchfork.toml) so it's true regardless of how
   it's started. See "Cross-repo dev links" below.

## Daemon Template

```toml
#:schema https://pitchfork.jdx.dev/schema.json

[daemons.<name>]
run = "exec <real start command>"       # exec = pitchfork tracks the actual PID, not a shell wrapper
port = { expect = [<port>], bump = false }  # bump=false: port is pinned elsewhere, don't silently renumber
ready_http = { url = "http://localhost:<port>/<health-path>", status = [200] }
mise = true                              # only if a tool-version file exists (step 3)
```

Non-HTTP daemon (watcher/worker):

```toml
[daemons.assets]
run = "exec <watch command>"
ready_delay = 2
```

If the watcher shows `stopped` immediately after starting with no error, it
may be exiting on stdin EOF (common for JS watch-mode CLIs, e.g. Tailwind's
`--watch`) — pitchfork gives daemons closed stdin by default. Confirm by
running the same command locally with `< /dev/null` (dies) vs an open pipe
(stays up), then fix with `run = "exec <watch command> < /dev/zero"`.

`namespace = "<project>"` at the top of the file is optional (pitchfork
infers one) — set it explicitly only when running pitchfork's CLI/MCP
commands by name would otherwise be ambiguous across projects.

## Validate Before Calling It Done

```bash
python3 -c "import tomllib; tomllib.load(open('pitchfork.toml','rb'))"
```

Then start it and check status/logs (via the pitchfork MCP tools or
`pitchfork start`/`pitchfork status`/`pitchfork logs`) to confirm the
daemon actually reaches "running" and the readiness check passes — a config
that parses can still reference the wrong port or command.

## Cross-Repo Dev Links

If one project links to another (e.g. an app's "Help" link points to a docs
site), and both run locally under pitchfork, the link target is app-level
config, not a pitchfork setting. Pattern: add an environment-conditional
config key in the app (e.g. `config :app, :docs_url`) defaulting to
production, overridden to `http://localhost:<port>` in the dev environment
config. Check whether the app already has a similar per-environment key
(e.g. a dev-only feature flag) and match that pattern instead of inventing a
new one. Remember: changing environment config on a running daemon usually
requires a restart, not just a recompile/hot-reload.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Guessing the port from framework defaults | Read it from the project's actual config file |
| Splitting an already-bundled watcher into its own daemon | Check if the main process already runs it (e.g. Phoenix watchers) |
| Skipping the tool-version check | Look for `.mise.toml`/`.tool-versions`/`.ruby-version`/`.node-version`; set `mise = true` if found |
| `ready_http` on a process with no HTTP port | Use `ready_delay` for pure watchers/workers instead |
| Never validating the TOML or starting the daemon | Parse-check it, then actually start it and read logs/status |
| Assuming a config edit takes effect immediately | Most app configs load at boot only — restart the daemon after editing |
| Watch-mode CLI shows `stopped` immediately after start, no error | It may exit on stdin EOF (pitchfork closes daemon stdin by default). Confirm with `< /dev/null` (dies) vs an open pipe (stays up), then fix with `run = "exec <watch command> < /dev/zero"` |
