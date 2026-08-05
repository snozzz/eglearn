# EGLearn handoff

Last updated: 2026-08-06 (Asia/Shanghai)

## User intent

Build the English-speaking practice workflow described in the referenced X post: practice in ChatGPT voice, receive a structured review, track progress, and optionally export to Obsidian. Optimize for the least user friction.

Hard requirements:

- use the user's ChatGPT Plus account, not the OpenAI API;
- never require, read, commit, or push GPT/API tokens;
- push each completed module to `git@github.com:snozzz/eglearn.git`;
- update this handoff before every module commit so a new conversation can continue safely.

## Architecture decision

- A Custom GPT in ChatGPT Plus is the voice practice surface.
- Voice mode cannot call Actions, Apps, MCP servers, or plugins.
- The user exits voice, stays in the same chat, and requests the structured review in text.
- MVP persistence is copy/import into the web app; an Action can be added later for post-voice auto-save.
- Obsidian is optional, initially one-way Markdown export.

See `docs/ARCHITECTURE.md` for constraints, rationale, and official sources.

## Module status

| Module | Status | Commit | Notes |
| --- | --- | --- | --- |
| 0. Foundation and security | Complete | `module-0-foundation` tag | Repo, no-API architecture, site shell, Custom GPT scaffold, secret scan |
| 1. Custom GPT and review contract | Pending | — | Tutor instructions, review schema, validation fixtures |
| 2. Session import and history | Pending | — | Local persistence, validated import, history UI |
| 3. Trends and retry comparison | Pending | — | Controlled error taxonomy and recurrence aggregation |
| 4. Obsidian export | Pending | — | Markdown download/copy, optional URI shortcut |
| 5. Privacy and end-to-end validation | Pending | — | Install/deploy docs, tests, final QA |

## Current implementation

- Sites/vinext scaffold is initialized and runs locally.
- Product shell explains the three-step flow and account boundary.
- Custom GPT configuration root exists at `gpt/`.
- `scripts/check-secrets.mjs` and `.githooks/pre-push` enforce credential checks.
- Module 0 passed lint, production build, server-rendered HTML tests, a live localhost content check, and positive/negative secret-scanner checks.

## Commands

```bash
npm ci
npm run hooks:install
npm run dev
npm run check:secrets
npm run check
```

## Next concrete task

Implement Module 1: add production Custom GPT instructions, formalize the session/review data contract, add evidence validation and fixtures, then update this document, commit, scan, and push.

## Open risks

- Post-voice transcripts are not guaranteed to be verbatim; corrections must remain conservative.
- Text cannot support pronunciation scoring and may not support fluency scoring without timing evidence.
- A GPT Action requires OAuth for safe multi-user storage and cannot run inside voice, so it is deferred until the copy/import workflow is validated.
