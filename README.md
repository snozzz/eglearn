# EGLearn

EGLearn turns a short English conversation in ChatGPT into a focused review and a trackable practice history.

Private MVP: [eglearn-speaking.hd701108.chatgpt.site](https://eglearn-speaking.hd701108.chatgpt.site)

## Important account boundary

- Speaking happens in the user's existing ChatGPT Plus session.
- The project does **not** call the OpenAI API and does not require an OpenAI API key.
- A Plus subscription and API billing are separate products; this repository never tries to reuse a ChatGPT login token as an API credential.
- Obsidian is an optional Markdown export target, not a prerequisite.

## Intended flow

1. Start the EGLearn Custom GPT in ChatGPT and switch to voice mode.
2. Speak for roughly 8–10 minutes around one realistic scenario.
3. Exit voice mode while staying in the same conversation.
4. Type `复盘并保存`; the private GPT Action validates and stores the structured review.
5. Open the dashboard link, revisit recurring issues, and export selected sessions to Obsidian when useful.

Voice mode cannot invoke Custom GPT Actions, Apps, MCP servers, or plugins. The Action therefore runs only after Voice mode ends. `生成复盘` plus the manual JSON importer remains the no-loss fallback. See [architecture](docs/ARCHITECTURE.md).

## Development

Requires Node.js 22.13 or newer.

```bash
npm ci
npm run hooks:install
npm run dev
```

Before every push:

```bash
npm run check:secrets
npm run check
```

The pre-push hook always runs the secret scan. Local secret files and common private-key formats are ignored by Git. Never add real credentials to examples, fixtures, screenshots, or documentation.

See the [user guide](docs/USER_GUIDE.md), [privacy statement](PRIVACY.md), and [MVP acceptance checklist](docs/ACCEPTANCE.md) before the first real practice.

## Repository map

- `app/` — local-first review importer and history dashboard
- `db/` — private D1 practice records and idempotent persistence
- `gpt/` — Custom GPT instructions, Action schema, setup guide, and evals
- `lib/review-contract.mjs` — strict review parser and semantic guardrails
- `lib/session-store.mjs` — validated IndexedDB persistence and sortable session IDs
- `lib/session-sync.mjs` — review hashing, cloud/local validation, and deduplication
- `lib/progress.mjs` — controlled recurrence, score-history, and reappearance aggregation
- `lib/obsidian-export.mjs` — safe YAML/Markdown rendering and optional Obsidian URI creation
- `docs/ARCHITECTURE.md` — product and technical decisions
- `HANDOFF.md` — current status for continuing in a new conversation
- `scripts/check-secrets.mjs` — repository-wide credential preflight
