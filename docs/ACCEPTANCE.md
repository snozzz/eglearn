# MVP acceptance checklist

## Custom GPT

- [ ] GPT Builder contains the exact committed `INSTRUCTIONS.md`.
- [ ] `KNOWLEDGE.md` is uploaded and the GPT returns schema version 1.0.
- [ ] All manual cases in `gpt/EVALS.md` pass, especially dual-session isolation.
- [ ] Voice practice does not claim it can save, time, call an Action, or assess pronunciation.

## Dashboard

- [ ] Valid fenced JSON previews before any write.
- [ ] Malformed JSON, unknown fields, score violations, and extra prose are rejected.
- [ ] Confirmed records survive a page reload in the same browser profile.
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

- [ ] No API key or ChatGPT token is required or documented.
- [ ] `npm run check` passes.
- [ ] A simulated secret is blocked by `npm run check:secrets`.
- [ ] Git worktree is clean and the module tag points to the pushed commit.
- [ ] `HANDOFF.md` names the current status, limitations, and next decision.
