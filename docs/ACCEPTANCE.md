# MVP acceptance checklist

## Custom GPT

- [ ] GPT Builder contains the exact committed `INSTRUCTIONS.md`.
- [ ] `KNOWLEDGE.md` is uploaded and the GPT returns schema version 1.0.
- [ ] All manual cases in `gpt/EVALS.md` pass, especially dual-session isolation.
- [ ] Voice practice does not claim it can save, time, call an Action during Voice, or assess pronunciation.
- [ ] `复盘并保存` calls `saveSpeakingReview` only after Voice ends and claims success only after `saved` or `already_saved`.
- [ ] `生成复盘` remains Action-free and returns exactly one fenced JSON block.

## Action and cloud storage

- [ ] `ACTION_OPENAPI.yaml` contains one HTTPS write operation and no credential.
- [ ] Missing or invalid Sites bearer access is rejected by the private Site before the Action route runs.
- [ ] A valid review saves once; retrying the same idempotency key returns the same record.
- [ ] Reusing an idempotency key for different content returns `409` and creates no second record.
- [ ] Unknown fields, invented owner/timestamp fields, invalid scores, and pronunciation claims return `422`.
- [ ] Oversized bodies return `413`; temporary storage failures do not return success.
- [ ] The Action request and logs never contain raw audio, a full transcript, a ChatGPT token, or an OpenAI API key.

## Dashboard

- [ ] Valid fenced JSON previews before any write.
- [ ] Malformed JSON, unknown fields, score violations, and extra prose are rejected.
- [ ] Confirmed records survive a page reload and appear after signing in on another browser.
- [ ] Cloud and local copies of the same normalized review count only once.
- [ ] Returning focus to the dashboard refreshes Action-created records.
- [ ] A sync failure preserves the manual local fallback and reports local-only state.
- [ ] A second record appears first and updates trends without duplicate-session inflation.
- [ ] Empty state, loading state, storage error, clipboard fallback, and narrow layout are understandable.
- [ ] Keyboard focus is visible on links, inputs, buttons, and expandable session rows.

## Progress claims

- [ ] `OTHER` never appears in cross-session recurrence.
- [ ] Frequent requires four distinct sessions.
- [ ] Unassessed points do not appear in score charts.
- [ ] UI never converts bands to percentages, CEFR, streaks, recurrence totals from model memory, or mastery claims.

## Obsidian

- [ ] Markdown YAML parses with numeric scores and stable session identity.
- [ ] Filename is cross-platform and stable for repeated export.
- [ ] Exactly one managed start/end marker survives hostile review text.
- [ ] Download and copy work without a Vault setting.
- [ ] URI requires a Vault, encodes the full path, uses clipboard, and contains no append/overwrite/silent/content flags.
- [ ] UI says the Obsidian request must be confirmed instead of claiming sync success.

## Privacy and release

- [ ] No OpenAI API key or ChatGPT session token is required or documented.
- [ ] The Sites identity-bypass value exists only in Sites/GPT Builder configuration and is absent from repository files and Git history.
- [ ] `npm run check` passes.
- [ ] A simulated secret is blocked by `npm run check:secrets`.
- [ ] Git worktree is clean and the module tag points to the pushed commit.
- [ ] `HANDOFF.md` names the current status, limitations, and next decision.
