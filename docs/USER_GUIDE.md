# EGLearn user guide

## What you need

- A ChatGPT Plus account that can create and use Custom GPTs.
- A modern browser for the EGLearn dashboard.
- Obsidian only if you want Markdown notes in a vault.

You do not need an OpenAI API account, OpenAI API key, microphone permission for the dashboard, separate backend account, or Obsidian plugin.

## One-time Custom GPT setup

1. Open ChatGPT and choose **Explore GPTs → Create**.
2. Name the GPT `EGLearn 口语教练`.
3. Copy all of `gpt/INSTRUCTIONS.md` into the GPT Instructions field.
4. Upload `gpt/KNOWLEDGE.md` as a knowledge file.
5. Enable Voice conversations.
6. Import `gpt/ACTION_OPENAPI.yaml` as an Action and follow `gpt/ACTION_SETUP.md` exactly. Put the private Sites bearer value only in GPT Builder authentication.
7. Add the conversation starters from `gpt/README.md`.
8. Keep the GPT private and run the cases in `gpt/EVALS.md`. Do not share this personal credential with other users.

## Each practice

1. Open the private [EGLearn 口语教练](https://chatgpt.com/g/g-6a78065a98848191843ca75c4f0d7c36-eglearn-kou-yu-jiao-lian) in ChatGPT and say `开始一次 10 分钟英语口语练习` or supply your own scenario.
2. Wait for the `Practice started — <topic>` marker, then switch to voice.
3. Practice. The coach should keep its turns short and avoid interrupting minor errors.
4. Exit voice mode but stay in the same chat.
5. Type `复盘并保存`.
6. Approve the Action if ChatGPT asks. Wait for `saved` or `already_saved` and open the returned dashboard link.
7. The record appears in history and is cached in this browser. Returning to the dashboard automatically refreshes the private cloud history.

The configured GPT is personal and must remain **Only me**. The link does not grant another account access and must not be republished with the current single-owner Action credential.

If automatic save fails, type `生成复盘`, copy the single JSON block into **手工备用导入**, validate it, and choose **确认保存并同步**. If the network is unavailable, the review remains in the local cache and can be synchronized later.

The dashboard performs structural validation. It cannot independently prove that a quote is verbatim because the transcript is not separately imported.

## Reading progress

- `新问题`: the controlled rule ID appeared in one saved session.
- `反复`: it appeared in two to three distinct sessions.
- `高频`: it appeared in at least four distinct sessions.
- `OTHER` is never aggregated.
- Grammar, vocabulary, and communication stay on their original 1–5 practice bands.
- A missing error is not treated as mastery unless a future version records a real opportunity to use that structure.

## Obsidian

The safest path is **下载 Markdown**. Move the file into `EGLearn/Speaking Sessions` in your vault. **复制 Markdown** is the backup.

For the URI shortcut:

1. Create `EGLearn/Speaking Sessions` in Obsidian first.
2. Enter the Vault name or ID and target folder in the dashboard.
3. Choose **在 Obsidian 中创建** on a saved session.
4. Confirm the note in Obsidian. EGLearn cannot read the vault or verify the result.

The shortcut never appends to or overwrites an existing note.

## Troubleshooting

- **Action is unavailable during voice:** this is expected. Exit Voice mode, stay in the same chat, then type `复盘并保存`.
- **Action reports authentication failure:** keep the GPT private and replace the Sites identity-bypass bearer value in GPT Builder; never paste it into chat or Git.
- **Action reports a temporary failure:** it may retry once with the same idempotency key. If no success is confirmed, use the JSON fallback.
- **Dashboard says local-only:** sign in to the private Site and choose **刷新** or **同步现有记录**.
- **GPT adds prose around JSON:** repeat `只返回一个 JSON 代码块` or check the current GPT instructions.
- **Dashboard rejects a review:** fix the listed field or regenerate the review with the v1.0 knowledge file.
- **Clipboard is blocked:** use the manual-copy box or download Markdown.
- **Obsidian does not open:** confirm Obsidian is installed and the Vault/folder values match this device; use download instead.
- **History disappeared:** confirm you are signed in to the private Site, then refresh cloud history. Unsynced local-only records can still be lost by clearing browser data.
- **Second practice includes the first:** make sure the GPT emitted a new `Practice started` marker before entering voice.
