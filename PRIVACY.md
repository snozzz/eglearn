# Privacy

EGLearn MVP is local-first and does not operate an application backend.

## Data locations

- Voice and chat content stay in the user's ChatGPT account and are governed by the user's ChatGPT settings and OpenAI terms.
- The dashboard receives only the review JSON the user explicitly pastes.
- Accepted reviews are stored in IndexedDB in the current browser profile.
- Obsidian Vault name and target folder are stored in browser local storage on the current device.
- Downloaded or copied Markdown is controlled by the user and may be moved into an Obsidian vault.

The dashboard does not request an OpenAI API key, reuse a ChatGPT token, upload reviews, send analytics, load advertising trackers, or read an Obsidian vault.

## Important limits

- Browser storage is not encrypted by EGLearn. Anyone with access to the unlocked browser profile may be able to inspect it.
- Clearing browser/site data can permanently remove practice history.
- **清空本机记录** permanently clears EGLearn's IndexedDB records in the current browser after a second confirmation. It cannot delete copies already downloaded, copied, or stored in Obsidian.
- Clipboard contents may be visible to the operating system and other software with clipboard permission.
- `obsidian://` can request that Obsidian create a file, but EGLearn cannot confirm whether it succeeded.
- ChatGPT post-voice transcripts may not be verbatim. The dashboard validates structure, not quote authenticity.

## Credentials

No OpenAI credential is required. Local environment files, common private-key formats, and credential files are excluded from Git. Every repository push runs `npm run check:secrets`; CI repeats the full security and test suite.
