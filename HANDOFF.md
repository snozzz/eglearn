# EGLearn handoff

Last updated: 2026-08-14 (Asia/Shanghai)

## User intent

Build the English-speaking practice workflow described in the referenced X post: practice in ChatGPT voice, receive a structured review, track progress, and optionally export to Obsidian. Optimize for the least user friction.

Hard requirements:

- use the user's ChatGPT Plus account, not the OpenAI API;
- never require, read, commit, or push GPT/API tokens;
- push each completed module to `git@github.com:snozzz/eglearn.git`;
- update this handoff before every module commit so a new conversation can continue safely.

## Architecture decision

- Ordinary Chat in the ChatGPT desktop app is the default voice surface because it provides GPT-Live.
- A new practice must begin as an empty Chat with **Start new voice chat** selected before any text is sent; text-first chats offer dictation instead.
- After Voice starts, the learner reads the short `EGLearn session starts now` marker and coaching instruction shown by the Site. The coach may make a few direct-audio pronunciation/flow checkpoints and ask for one repeat.
- The user exits Voice, stays in the same Chat, pastes the complete self-contained v1.1 deep-review prompt, and copies the returned JSON.
- The dashboard explicitly reads or accepts that copied JSON, validates it, previews evidence, and saves only after user confirmation.
- Structured reviews are stored in Sites D1 and cached in browser IndexedDB.
- Obsidian is optional, initially one-way Markdown export.
- The private Custom GPT + Action remains deployed as an optional compatibility path, but is no longer the recommended speaking flow.

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
| 6. Plus + GPT Action sync | Complete and deployed | `module-6-plus-action` tag | Private Action write endpoint, D1, idempotency, cloud/local merge, generated OpenAPI, GPT v1.1 instructions |
| 7. Private Custom GPT launch | Complete | `module-7-private-gpt` tag | Only-me GPT, encrypted custom-header credential, live Action save, dashboard reload verification |
| 8. Chat + GPT-Live clipboard loop | Complete and deployed | `7282200` / `module-8-chat-gpt-live` | Voice-first launcher, full post-Voice prompt, one-click clipboard import, 64 KiB limit, primary-flow docs |
| 9. Deep oral review | Complete and deployed | `cec7a53` / `module-9-deep-oral-review` | v1.1 deep review, multi-segment coverage, up to 12 issues, live pronunciation/fluency evidence boundary, richer dashboard and Obsidian export |
| 10. Voice checkpoint transcript bridge | Complete and deployed | `0561202` / `module-10-live-checkpoints` | Labelled live checkpoints and end-of-Voice oral recap for pronunciation, fluency, naturalness, and grammar feedback that remains in Chat text |
| 11. Import error diagnostics | Complete and deployed | `579e90b` / `module-11-import-diagnostics` | Version-aware validation and actionable field errors instead of generic `Invalid input` |
| 12. Chat review import compatibility | Complete; pending deployment | — | v1.1 strengths retain up to three evidence quotes; transcript-only fluency accepts the historical `not_available` alias and normalizes it to `none`; generation prompt now states both constraints explicitly |

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
- Module 6 binds Sites D1, stores normalized review JSON with server IDs/timestamps, uses owner-scoped idempotency keys, and exposes only `POST /api/actions/reviews` to the GPT.
- Browser history requires the authenticated Sites user, merges cloud records with an IndexedDB offline cache, refreshes when the dashboard regains focus, and keeps manual JSON import as fallback.
- `gpt/ACTION_OPENAPI.yaml` is generated from the same Zod contract. `复盘并保存` calls the Action only after Voice ends; `生成复盘` remains Action-free.
- The personal Site and GPT must remain private. The Sites identity-bypass bearer value belongs only in Sites/GPT Builder configuration and never in this repository.
- Module 7 created the private `EGLearn 口语教练` Custom GPT and configured its Action with API-key authentication, custom header `OAI-Sites-Authorization`, and an encrypted Sites bypass value.
- A three-turn text practice (105 learner words) completed the real ChatGPT Action consent flow and saved one review. Reloading the private dashboard showed the cloud record `Free conversation about an English-learning project`.
- The live smoke test intentionally did not start Voice. One real post-voice practice remains the final human acceptance check because Voice itself cannot be automated without microphone access and the Action cannot run until Voice ends.
- Module 8 changes the primary path to ordinary Chat + GPT-Live. `lib/chat-live-prompts.mjs` derives the complete review prompt from the controlled rule IDs and exact no-assessment reasons used by the Zod contract.
- `app/chat-live-launcher.tsx` enforces the voice-first ordering in product copy, exposes the short spoken marker, and copies the long post-Voice prompt with a manual fallback.
- The dashboard now treats copied JSON import as the primary flow. An explicit clipboard-read click validates immediately; denied permission falls back to the textarea. Inputs over 64 KiB are rejected.
- Module 8 does not delete or reconfigure the existing private GPT, Action route, D1 data, or Sites bypass credential. That path remains optional and must stay private.
- Module 9 keeps v1.0 records and the legacy Action path compatible while adding `reviewSchemaV11` for the default Chat flow. Transcript evidence now drives multi-segment deep review, while oral observations are accepted only when the same Voice context supplies direct audio evidence or an explicit checkpoint.
- The dashboard now displays the full v1.1 issue list, segment drills, oral observations, live corrections, and an explicit “no audio evidence” boundary. Obsidian export includes the same sections.
- Module 10 adds a spoken `[EGLearn live checkpoint]` protocol every few substantive turns and a `[EGLearn oral recap]` before ending Voice. The post-Voice prompt uses those labelled coach messages as oral evidence only; it rejects them as learner evidence.
- `oralAnalysis.evidenceMode=live_checkpoint` distinguishes this path from a future raw-audio path and keeps v1.0/v1.1 stored records compatible.
- Module 12 keeps all three v1.1 strength evidence quotes instead of rejecting or truncating them, and canonicalizes transcript-only `scores.fluency.basis=not_available` to the stored contract value `none`. The generated review prompt now explicitly requires at most three evidence quotes per strength and `basis=none` when audio is unavailable. The supplied full v1.1 review imported successfully in the local page without being saved; no personal content was added to fixtures.

## Current release

- Private MVP: `https://eglearn-speaking.hd701108.chatgpt.site`
- Optional private Custom GPT: `https://chatgpt.com/g/g-6a78065a98848191843ca75c4f0d7c36-eglearn-kou-yu-jiao-lian`
- Site deployment: version 6 from commit `579e90b129b650141d569b7f48698c1c9e470c51`
- Site access: owner-only custom access, zero allowed groups, zero external visitors.
- GPT visibility: `Only me`. Do not change it while the shared personal Action credential is configured.
- The Sites bypass value was rotated during Module 7 setup. The current value is stored only by Sites and GPT Builder and is intentionally absent from this handoff and Git.
- The Module 6 source passes 48 automated contract, Action, sync, UI, and storage tests plus lint, production build, and secret scan.
- The Module 8 source passes 52 automated Chat-prompt, contract, Action-regression, sync, UI, and storage tests. Module 9 passes 56 tests plus lint, production build, and secret scan (69 repository files). Module 10 passes 57 tests plus the same checks. Module 11 passes 59 tests plus the same checks; Module 12 passes 63 tests plus lint, production build, and secret scan. The private Site remains deployed as version 6; Module 12 is awaiting deployment.
- The dashboard currently contains one synthetic acceptance record created by the live Action smoke test. It is clearly about the EGLearn project and may be removed with **删除全部记录** before real usage if the learner wants an empty history.

## Commands

```bash
npm ci
npm run hooks:install
npm run dev
npm run check:secrets
npm run check
```

## Next concrete task

Refresh the deployed dashboard, then re-import the same supplied review JSON to verify Module 12 in the live page. If a review is rejected, read the field-level error shown under the import box. For a new practice, open a new empty **Chat**, choose **Start new voice chat** before sending any text, read the Site's starter, and confirm `[EGLearn live checkpoint]` and `[EGLearn oral recap]` appear before copying the deep-review JSON into EGLearn.

## Open risks

- Post-voice transcripts are not guaranteed to be verbatim; corrections must remain conservative.
- A post-Voice text context cannot support pronunciation scoring or precise fluency timing. Only direct Voice evidence/checkpoints may add qualitative oral observations; this is not a phoneme, accent, WPM, or duration analyzer.
- The private Action credential is single-owner. Publishing or sharing the GPT requires per-user OAuth and owner-isolated rows first.
- Ordinary Chat has no EGLearn plugin or Action context, so the full post-Voice review prompt must be pasted every practice. A short command alone is not reliable.
- Starting the Chat with a text bootstrap defeats the intended GPT-Live entry path; the short coaching instruction must be spoken after Voice starts.
- Unsynced IndexedDB fallback records remain device/profile-local and can be cleared by browser settings.
- Browser automation could not claim the localhost preview because the browser URL policy blocked local control. Production builds, server-render tests, live HTTP content checks, and pure IndexedDB tests provide the current automated evidence; manual visual acceptance remains in `docs/ACCEPTANCE.md`.
