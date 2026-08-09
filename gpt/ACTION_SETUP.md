# EGLearn GPT Action setup

This Action saves a structured post-voice review to the same private EGLearn Site. It does not call the OpenAI API and does not use an OpenAI API key.

## Before setup

- Keep both the EGLearn Site and Custom GPT private for the personal MVP.
- Deploy the D1-backed version before testing the Action.
- Never copy an Action credential into this repository, a chat message, a screenshot, or a log.

## GPT Builder

1. Open the private `EGLearn 口语教练` in GPT Builder.
2. Add an Action and import `ACTION_OPENAPI.yaml`.
3. Configure API-key authentication with a custom header.
4. Use header name `OAI-Sites-Authorization`.
5. Use the Site's identity-bypass bearer value as the encrypted secret. The configured value must include the `Bearer ` prefix required by Sites.
6. Keep the GPT private. Do not publish a GPT that shares this personal credential.
7. Test `saveSpeakingReview` in Builder Preview with a valid v1.0 review.
8. Run every case in `EVALS.md` before relying on automatic save.

The secret belongs only in the Sites access control and GPT Builder authentication fields. It is not an OpenAI API credential, but it grants access to the private Action route and must be treated like a password.

## Commands

- `复盘并保存`: generate the current v1.0 review and call the Action.
- `生成复盘`: return one fenced JSON block without calling the Action; this is the manual fallback.

Actions cannot run while Voice mode is active. Exit Voice mode first, remain in the same conversation, then send the save command in text.

## Rotation

If the identity-bypass value is ever exposed, rotate it in Sites immediately, update GPT Builder, and test the Action again. Do not commit either the old or new value.
