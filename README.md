# EGLearn

EGLearn turns a short English conversation in ChatGPT into a focused review and a trackable practice history.

## Important account boundary

- Speaking happens in the user's existing ChatGPT Plus session.
- The project does **not** call the OpenAI API and does not require an OpenAI API key.
- A Plus subscription and API billing are separate products; this repository never tries to reuse a ChatGPT login token as an API credential.
- Obsidian is an optional Markdown export target, not a prerequisite.

## Intended flow

1. Start the EGLearn Custom GPT in ChatGPT and switch to voice mode.
2. Speak for roughly 8–10 minutes around one realistic scenario.
3. Exit voice mode while staying in the same conversation.
4. Type `生成复盘` and copy the structured result into the EGLearn dashboard.
5. Revisit recurring issues; export selected sessions to Obsidian when useful.

Voice mode cannot invoke Custom GPT Actions, Apps, MCP servers, or plugins. The first release therefore uses a deliberate text-after-voice import step. See [architecture](docs/ARCHITECTURE.md).

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

## Repository map

- `app/` — EGLearn web dashboard
- `db/` — durable practice data schema
- `gpt/` — Custom GPT instructions and knowledge files
- `lib/review-contract.mjs` — strict review parser and semantic guardrails
- `docs/ARCHITECTURE.md` — product and technical decisions
- `HANDOFF.md` — current status for continuing in a new conversation
- `scripts/check-secrets.mjs` — repository-wide credential preflight
