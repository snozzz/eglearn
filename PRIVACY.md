# Privacy

EGLearn uses a private Sites database for automatic post-voice review sync and keeps an IndexedDB cache in the current browser.

## Data locations

- Voice and chat content stay in the user's ChatGPT account and are governed by the user's ChatGPT settings and OpenAI terms.
- The GPT Action sends only the structured v1.0 review after the user exits Voice mode and explicitly asks to save it. It does not send raw audio or a separate full transcript.
- Accepted reviews are stored in the private EGLearn Sites D1 database and cached in IndexedDB in the current browser profile.
- Manual imports are sent to the same private database when sync is available; otherwise they remain in the local cache until the user retries synchronization.
- Obsidian Vault name and target folder are stored in browser local storage on the current device.
- Downloaded or copied Markdown is controlled by the user and may be moved into an Obsidian vault.

The dashboard does not request an OpenAI API key, reuse a ChatGPT session token, send analytics, load advertising trackers, or read an Obsidian vault.

## Important limits

- Browser storage is not encrypted by EGLearn. Anyone with access to the unlocked browser profile may be able to inspect it.
- Clearing browser/site data can remove the offline cache, but a successful private-cloud sync remains available after signing in again.
- **删除全部记录** requests deletion from both the private database and the current browser after a second confirmation. The interface reports partial failure instead of claiming all copies were deleted. It cannot delete copies already downloaded, copied, or stored in Obsidian.
- Clipboard contents may be visible to the operating system and other software with clipboard permission.
- `obsidian://` can request that Obsidian create a file, but EGLearn cannot confirm whether it succeeded.
- ChatGPT post-voice transcripts may not be verbatim. The dashboard validates structure, not quote authenticity.

## Credentials

No OpenAI credential is required. The private Action uses a Sites identity-bypass value stored only in Sites and GPT Builder; it is not an OpenAI API key and must be treated like a password. Local environment files, common private-key formats, and credential files are excluded from Git. Every repository push runs `npm run check:secrets`; CI repeats the full security and test suite.

The personal Action credential represents one private owner. Do not share or publish the configured GPT. A multi-user release must replace the shared credential with per-user OAuth and user-isolated storage.
