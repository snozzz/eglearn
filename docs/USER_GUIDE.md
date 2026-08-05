# EGLearn user guide

## What you need

- A ChatGPT Plus account that can create and use Custom GPTs.
- A modern browser for the EGLearn dashboard.
- Obsidian only if you want Markdown notes in a vault.

You do not need an OpenAI API account, API key, microphone permission for the dashboard, backend account, or Obsidian plugin.

## One-time Custom GPT setup

1. Open ChatGPT and choose **Explore GPTs → Create**.
2. Name the GPT `EGLearn 口语教练`.
3. Copy all of `gpt/INSTRUCTIONS.md` into the GPT Instructions field.
4. Upload `gpt/KNOWLEDGE.md` as a knowledge file.
5. Enable Voice conversations. Do not add an Action for the MVP.
6. Add the conversation starters from `gpt/README.md`.
7. Keep the GPT private and run the cases in `gpt/EVALS.md` before sharing it.

## Each practice

1. Open the EGLearn Custom GPT in text and say `开始一次 10 分钟英语口语练习` or supply your own scenario.
2. Wait for the `Practice started — <topic>` marker, then switch to voice.
3. Practice. The coach should keep its turns short and avoid interrupting minor errors.
4. Exit voice mode but stay in the same chat.
5. Type `生成复盘`.
6. Copy the single JSON code block into the dashboard and choose **检查复盘**.
7. Read the original/rewrite preview. If it matches your chat, choose **确认保存到本机**.

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

- **GPT adds prose around JSON:** repeat `只返回一个 JSON 代码块` or check the current GPT instructions.
- **Dashboard rejects a review:** fix the listed field or regenerate the review with the v1.0 knowledge file.
- **Clipboard is blocked:** use the manual-copy box or download Markdown.
- **Obsidian does not open:** confirm Obsidian is installed and the Vault/folder values match this device; use download instead.
- **History disappeared:** IndexedDB belongs to the current browser profile and may be removed by clearing site data. Download important Markdown notes.
- **Second practice includes the first:** make sure the GPT emitted a new `Practice started` marker before entering voice.
