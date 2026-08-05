# EGLearn Custom GPT configuration

This directory contains the versioned configuration for the EGLearn speaking coach in ChatGPT.

## Builder setup

1. In ChatGPT, create a new GPT from **Explore GPTs → Create**.
2. Name it `EGLearn 口语教练`.
3. Paste the complete contents of `INSTRUCTIONS.md` into Instructions.
4. Upload `KNOWLEDGE.md` as a knowledge file.
5. Enable Voice conversations. Do not add an Action for the MVP.
6. Add these conversation starters:
   - `开始一次 10 分钟英语口语练习`
   - `练习一次英文面试`
   - `根据这次对话生成复盘`
7. Keep the GPT private while testing.

## User flow

1. Open the Custom GPT in text and choose a scenario.
2. Switch to voice mode and practice.
3. Exit voice mode while staying in the same conversation.
4. Type `生成复盘`.
5. Copy the single JSON code block into the EGLearn web app.

ChatGPT Plus and API billing are separate. This setup never requests an OpenAI API key. Voice mode cannot invoke Actions, Apps, MCP servers, or plugins, which is why the save/import step happens after voice mode ends.

## Versioning

`INSTRUCTIONS.md` and `KNOWLEDGE.md` both declare contract version `1.0`. Update the parser and tests before changing that version. Do not silently edit the live GPT without committing the same change here.
