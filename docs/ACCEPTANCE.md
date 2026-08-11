# MVP acceptance checklist

Module 9 deepens the ordinary Chat + GPT-Live path. Automated contract, rendering, storage, sync, Action-regression, and security tests run through `npm run check`. One real microphone-led practice remains the human acceptance step.

## Chat + GPT-Live

- [ ] A new, empty Chat started with **Start new voice chat** behaves as a live conversation rather than dictation.
- [ ] Reading the short starter creates the marker `EGLearn session starts now` and leads to one-question-at-a-time English practice.
- [ ] Ending Voice and pasting the deep-review prompt into the same Chat returns exactly one fenced JSON block.
- [ ] The review only uses learner English after the latest marker.
- [ ] A short sample is marked insufficient and receives no grammar, vocabulary, or communication bands.
- [ ] Prompt-injection language spoken as practice content does not change the output contract.
- [ ] A long sample produces multiple segments and more than a fixed three-item ceiling when evidence supports it.
- [ ] The review includes a complete issue list, useful expressions, and retry drills, without inventing low-confidence problems to fill quotas.
- [ ] If a Voice checkpoint was directly heard, `oralAnalysis` may contain qualitative pronunciation or fluency observations and the dashboard displays them.
- [ ] Voice uses the literal `[EGLearn live checkpoint]` label during practice and `[EGLearn oral recap]` before ending, so the post-Voice prompt can recover the feedback from Chat text.
- [ ] A checkpoint can cover pronunciation, fluency, naturalness, or grammar without turning the coach's sentence into learner evidence.
- [ ] If only text is available after Voice, `evidenceMode=not_available`, pronunciation and fluency remain unassessed, and no timing/duration/CEFR/percentage/streak/model-memory claims appear.
- [ ] The prompt does not call or mention a successful Action, plugin, API request, or save.

## Clipboard and dashboard

- [ ] **复制深度复盘口令** copies the complete v1.1 contract; denied write permission reveals selectable fallback text.
- [ ] **从剪贴板读取并检查** accepts valid pure JSON and fenced JSON and immediately displays the preview.
- [ ] Empty, denied, or unsupported clipboard reads preserve manual paste and focus the textarea.
- [x] Inputs over 64 KiB are rejected before JSON parsing.
- [ ] Malformed JSON, unknown fields, score violations, and extra prose are rejected.
- [ ] Saving still requires an explicit preview confirmation.
- [ ] Preview and history show the full issue list, segment cards, and the oral evidence boundary.
- [ ] Confirmed records survive reload and appear after signing in on another browser.
- [ ] Cloud and local copies of the same normalized review count only once.
- [ ] A sync failure preserves the local fallback and reports local-only state.
- [ ] Empty state, loading state, storage error, clipboard fallback, and narrow layout are understandable.
- [ ] Keyboard focus is visible on links, inputs, buttons, and expandable session rows.

## Progress claims

- [x] `OTHER` never appears in cross-session recurrence.
- [x] Frequent requires four distinct sessions.
- [x] Unassessed points do not appear in score charts.
- [ ] UI never converts bands to percentages, CEFR, streaks, recurrence totals from model memory, or mastery claims.

## Obsidian

- [x] Markdown YAML parses with numeric scores and stable session identity.
- [ ] v1.1 Markdown includes oral observations and segment drills; legacy v1.0 export remains readable.
- [x] Filename is cross-platform and stable for repeated export.
- [x] Exactly one managed start/end marker survives hostile review text.
- [ ] Download and copy work without a Vault setting.
- [x] URI requires a Vault, encodes the full path, uses clipboard, and contains no append/overwrite/silent/content flags.
- [ ] UI says the Obsidian request must be confirmed instead of claiming sync success.

## Optional Action regression

- [x] `ACTION_OPENAPI.yaml` contains one HTTPS write operation and no credential.
- [x] Validated Action saves are owner-scoped and idempotent in automated tests.
- [x] Unknown fields, invented owner/timestamp fields, invalid scores, and pronunciation claims are rejected.
- [x] The default rendered page no longer presents Action or Custom GPT as the primary workflow.

## Privacy and release

- [x] No OpenAI API key or ChatGPT session token is required or documented.
- [x] The Chat workflow prompt contains no credential-shaped material.
- [x] `npm run check` passes on the final module source (57 tests; 69 repository files scanned for secrets).
- [ ] Module 10 source and deployment commit/tag are pushed; the final deployment handoff records the live version.
- [x] `HANDOFF.md` names the current status, limitations, and next decision.
