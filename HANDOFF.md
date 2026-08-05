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
| 0. Foundation and security | Complete | `9f85771` / `module-0-foundation` | Repo, no-API architecture, site shell, Custom GPT scaffold, secret scan |
| 1. Custom GPT and review contract | Complete | `module-1-gpt-contract` tag | Tutor instructions, strict review structure, manual evals, 18 contract tests |
| 2. Session import and history | Complete | `module-2-local-history` tag | Confirm-before-save import, IndexedDB persistence, expandable history UI |
| 3. Trends and retry comparison | Complete | `module-3-progress` tag | Recurrence statuses, 1–5 band history, latest reappearance comparison |
| 4. Obsidian export | Complete | `module-4-obsidian-export` tag | Typed YAML, stable Markdown, download/copy, optional clipboard URI |
| 5. Privacy and end-to-end validation | Complete | `module-5-mvp` tag | Privacy/data controls, CI, user guide, acceptance checklist, private hosting config |

## Current implementation

- Sites/vinext scaffold is initialized and runs locally.
- Product shell explains the three-step flow and account boundary.
- Custom GPT configuration root exists at `gpt/`.
- `scripts/check-secrets.mjs` and `.githooks/pre-push` enforce credential checks.
- Module 0 passed lint, production build, server-rendered HTML tests, a live localhost content check, and positive/negative secret-scanner checks.
- Module 1 adds production GPT Builder instructions, the v1.0 knowledge contract, session-boundary rules, manual prompt evals, and a strict Zod parser.
- Import validation is structural: quotes are required, but without a separately imported transcript the dashboard cannot prove they are verbatim learner utterances.
- Module 2 adds the client-side import/preview/confirmation flow, ULID-style sortable session IDs, IndexedDB persistence, and expandable local history. Invalid reviews are revalidated at the storage boundary.
- Module 3 aggregates only controlled rule IDs across distinct sessions, excludes `OTHER`, charts assessed 1–5 bands without percentages, and compares the latest two appearances without claiming mastery.
- Module 4 renders safe Obsidian Markdown with typed YAML, a managed-region hash and stable filenames; the UI supports download/copy plus a non-destructive `obsidian://new` clipboard shortcut and manual-copy fallback.
- Module 5 adds two-step local-data deletion, keyboard focus styles, user/privacy/acceptance documentation, GitHub CI, and a private Sites project configuration.

## Commands

```bash
npm ci
npm run hooks:install
npm run dev
npm run check:secrets
npm run check
```

## Next concrete task

No required implementation task remains for MVP v1. The next product-validation step is user-owned: create the private Custom GPT from `gpt/INSTRUCTIONS.md` + `gpt/KNOWLEDGE.md`, run all cases in `gpt/EVALS.md`, then complete two real practices and inspect the dashboard/Obsidian flow before considering a post-voice OAuth Action.

## Open risks

- Post-voice transcripts are not guaranteed to be verbatim; corrections must remain conservative.
- Text cannot support pronunciation scoring and may not support fluency scoring without timing evidence.
- A GPT Action requires OAuth for safe multi-user storage and cannot run inside voice, so it is deferred until the copy/import workflow is validated.
- Browser IndexedDB is device/profile-local and can be cleared by browser settings; important sessions should be exported to Markdown.
- Browser automation could not claim the localhost preview because the browser URL policy blocked local control. Production builds, server-render tests, live HTTP content checks, and pure IndexedDB tests provide the current automated evidence; manual visual acceptance remains in `docs/ACCEPTANCE.md`.
