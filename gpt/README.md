# EGLearn Custom GPT configuration

This directory contains the versioned configuration for the EGLearn speaking coach in ChatGPT.

## Builder setup

1. In ChatGPT, create a new GPT from **Explore GPTs → Create**.
2. Name it `EGLearn 口语教练`.
3. Paste the complete contents of `INSTRUCTIONS.md` into Instructions.
4. Upload `KNOWLEDGE.md` as a knowledge file.
5. Enable Voice conversations.
6. Add the private Action from `ACTION_OPENAPI.yaml` by following `ACTION_SETUP.md`. Configure its credential only in GPT Builder, never in this repository.
7. Add these conversation starters:
   - `开始一次 10 分钟英语口语练习`
   - `练习一次英文面试`
   - `退出 Voice 后复盘并保存`
8. Keep the GPT private while testing.

## User flow

1. Open the Custom GPT in text and choose a scenario.
2. Switch to voice mode and practice.
3. Exit voice mode while staying in the same conversation.
4. Type `复盘并保存`.
5. After the Action confirms success, open the returned EGLearn dashboard link. If automatic save fails, use `生成复盘` and paste the JSON into the manual fallback.

ChatGPT Plus and API billing are separate. This setup never requests an OpenAI API key. Voice mode cannot invoke Actions, Apps, MCP servers, or plugins, which is why the Action runs only after voice mode ends.

## Versioning

`INSTRUCTIONS.md` is behavior version `1.1`; the review contract in `KNOWLEDGE.md` remains `1.0`. Update the parser, generated Action schema, and tests before changing the contract. Do not silently edit the live GPT without committing the same change here.
