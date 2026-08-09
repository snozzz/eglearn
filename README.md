# EGLearn

EGLearn turns a short English conversation in ChatGPT into a focused review and a trackable practice history.

Private MVP: [eglearn-speaking.hd701108.chatgpt.site](https://eglearn-speaking.hd701108.chatgpt.site)

## Important account boundary

- Speaking happens in the user's existing ChatGPT Plus session.
- The project does **not** call the OpenAI API and does not require an OpenAI API key.
- A Plus subscription and API billing are separate products; this repository never tries to reuse a ChatGPT login token as an API credential.
- Obsidian is an optional Markdown export target, not a prerequisite.

## Intended flow

1. In the ChatGPT desktop app, choose ordinary **Chat** and open a new, empty chat.
2. Select **Start new voice chat before sending any message**, then read the short starter shown on the EGLearn dashboard.
3. Speak for roughly 8–10 minutes around one realistic scenario and end Voice.
4. Copy EGLearn's complete review prompt into the same Chat; Chat returns one validated-format JSON block.
5. Copy the JSON, return to EGLearn, choose **从剪贴板读取并检查**, review the evidence, and confirm the save.
6. Revisit recurring issues and export selected sessions to Obsidian when useful.

Starting from an empty chat in Voice mode is what activates GPT-Live. The full review contract is intentionally pasted only after Voice ends, because sending a text bootstrap first would start the chat in text/dictation mode. The default workflow uses no Work mode, plugin, GPT Action, or OpenAI API. See [architecture](docs/ARCHITECTURE.md).

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

- `app/` — GPT-Live launcher, review importer, and history dashboard
- `db/` — private D1 practice records and idempotent persistence
- `lib/chat-live-prompts.mjs` — spoken Voice marker and complete post-Voice review prompt
- `gpt/` — retained optional private Custom GPT/Action configuration; not the default path
- `lib/review-contract.mjs` — strict review parser and semantic guardrails
- `lib/session-store.mjs` — validated IndexedDB persistence and sortable session IDs
- `lib/session-sync.mjs` — review hashing, cloud/local validation, and deduplication
- `lib/progress.mjs` — controlled recurrence, score-history, and reappearance aggregation
- `lib/obsidian-export.mjs` — safe YAML/Markdown rendering and optional Obsidian URI creation
- `docs/ARCHITECTURE.md` — product and technical decisions
- `HANDOFF.md` — current status for continuing in a new conversation
- `scripts/check-secrets.mjs` — repository-wide credential preflight
