# EGLearn user guide

## What you need

- A ChatGPT Plus account with ChatGPT Voice available in the desktop app.
- A modern browser for the EGLearn dashboard.
- Obsidian only if you want Markdown notes in a vault.

You do not need an OpenAI API account, OpenAI API key, Custom GPT, Work mode, plugin, microphone permission for the dashboard, separate backend account, or Obsidian plugin.

## Before the first practice

1. Install or open the ChatGPT desktop app and sign in to the Plus account.
2. Confirm that a new, empty Chat shows **Start new voice chat**.
3. Keep the private EGLearn dashboard open in a browser. It supplies both prompts and receives the review.

Do not send a text prompt before starting Voice. According to the current ChatGPT Voice flow, a chat must begin in Voice mode to use GPT-Live; a text-first chat offers dictation instead.

## Each practice

1. In the ChatGPT desktop app, choose **Chat** and create a new, empty chat.
2. Before sending anything, select **Start new voice chat**.
3. On EGLearn, find **对着 GPT-Live 读开场口令** and read that English text aloud. The marker `EGLearn session starts now` separates this practice from older content.
4. Practice for as long as useful. The coach should keep its turns short. Every few substantive turns it may say **`[EGLearn live checkpoint]`** and record a directly heard pronunciation, fluency, naturalness, or grammar observation; repeat once when asked and continue. Before you finish, it should say **`[EGLearn oral recap]`** with a short summary so the feedback remains in the Chat transcript.
5. Select **End** but stay in the same Chat.
6. On EGLearn, choose **复制深度复盘口令**, paste it into that Chat, and send it.
7. Copy the single JSON block Chat returns.
8. Return to EGLearn and choose **从剪贴板读取并检查**. If clipboard permission is unavailable, paste into the textarea and choose **检查已粘贴内容**.
9. Check the quoted learner sentence, then choose **确认保存并同步**.
10. The record appears in history and is cached in this browser. If private cloud sync is unavailable, the record remains in the local cache for a later retry.

The dashboard performs structural validation. It cannot independently prove that a quote is verbatim because the transcript is not separately imported. A deep v1.1 review should include multiple segments, a fuller issue list, useful expressions, and retry drills instead of stopping at three bullets.

Pronunciation and fluency have a hard evidence boundary. The review may use a checkpoint or oral recap only when those labels actually appear in the Chat transcript; it will show this as “Voice checkpoint 已写入 Chat”. If the returned context contains only ordinary text, the dashboard shows “未获得可核对音频” and leaves those dimensions unassessed. It never infers accent, phonemes, WPM, pause seconds, or speaking duration from a transcript.

The older private Custom GPT + Action configuration remains in `gpt/` as an optional compatibility path, but it is not required for the Chat + GPT-Live workflow.

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

- **Voice button is only dictation:** start a brand-new empty Chat and select **Start new voice chat** before sending text.
- **Chat behaves like a general assistant:** end the session, copy the deep-review prompt from EGLearn, and paste it into the same Chat. Do not use the short spoken starter as the review request.
- **Clipboard read is denied:** paste the copied JSON into the textarea with ⌘V / Ctrl+V and choose **检查已粘贴内容**.
- **Dashboard says local-only:** sign in to the private Site and choose **刷新** or **同步现有记录**.
- **Chat adds prose around JSON:** paste the complete review prompt again and ask for exactly one fenced JSON block.
- **Dashboard rejects a review:** fix the listed field or regenerate it with the current v1.1 deep-review prompt. Legacy v1.0 records remain importable.
- **Clipboard is blocked:** use the manual-copy box or download Markdown.
- **Obsidian does not open:** confirm Obsidian is installed and the Vault/folder values match this device; use download instead.
- **History disappeared:** confirm you are signed in to the private Site, then refresh cloud history. Unsynced local-only records can still be lost by clearing browser data.
- **Second practice includes the first:** start a new Chat or make sure you read `EGLearn session starts now` at the beginning of the latest Voice session.
