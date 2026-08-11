# Privacy

EGLearn uses a private Sites database for user-confirmed structured review storage and keeps an IndexedDB cache in the current browser.

## Data locations

- Voice and chat content stay in the user's ChatGPT account and are governed by the user's ChatGPT settings and OpenAI terms.
- In the default Chat + GPT-Live path, the user explicitly copies the post-Voice structured review from Chat and pastes or reads it from the clipboard in EGLearn. EGLearn cannot read the ChatGPT conversation automatically.
- Only after the user previews and confirms the structured review does the dashboard send it to the private EGLearn Sites D1 database and cache it in IndexedDB in the current browser profile.
- The dashboard does not upload raw audio or a separate full transcript. A v1.1 review may contain a small, user-visible record of a Voice checkpoint (target word, correction cue, and whether the repeat improved); it still does not upload an audio file. If cloud sync is unavailable, the review remains in the local cache until the user retries synchronization.
- Obsidian Vault name and target folder are stored in browser local storage on the current device.
- Downloaded or copied Markdown is controlled by the user and may be moved into an Obsidian vault.

The dashboard does not request an OpenAI API key, reuse a ChatGPT session token, call a ChatGPT plugin or Action in the default path, send analytics, load advertising trackers, or read an Obsidian vault.

## Important limits

- Browser storage is not encrypted by EGLearn. Anyone with access to the unlocked browser profile may be able to inspect it.
- Clearing browser/site data can remove the offline cache, but a successful private-cloud sync remains available after signing in again.
- **删除全部记录** requests deletion from both the private database and the current browser after a second confirmation. The interface reports partial failure instead of claiming all copies were deleted. It cannot delete copies already downloaded, copied, or stored in Obsidian.
- Clipboard contents may be visible to the operating system and other software with clipboard permission.
- `obsidian://` can request that Obsidian create a file, but EGLearn cannot confirm whether it succeeded.
- ChatGPT post-voice transcripts may not be verbatim. The dashboard validates structure, not quote authenticity.
- Direct Voice observations are evidence-bounded: if the same Chat context cannot provide audio evidence, EGLearn records that pronunciation and fluency were not assessed. It does not infer accent, phonemes, WPM, pause timing, or duration from text.

## Credentials

No OpenAI credential is required. Chat + GPT-Live uses the learner's existing Plus session, while the browser dashboard uses the private Site's own signed-in session. Neither value is copied into EGLearn source or prompts. Local environment files, common private-key formats, and credential files are excluded from Git. Every repository push runs `npm run check:secrets`; CI repeats the full security and test suite.

The repository retains an older optional private Custom GPT + Action path. Its existing Sites identity-bypass value remains a password-like single-owner credential stored only in Sites/GPT Builder. It is not involved in the default Chat + GPT-Live flow and the configured GPT must not be shared while that credential remains active.
