import assert from "node:assert/strict";
import test from "node:test";
import {
  reviewPrompt,
  voiceSessionMarker,
  voiceStarterSpoken,
} from "../lib/chat-live-prompts.mjs";
import {
  errorRuleIds,
  fluencyUnassessedReasonZh,
  pronunciationUnassessedReasonZh,
} from "../lib/review-contract.mjs";

test("voice starter creates a stable spoken session boundary", () => {
  assert.ok(voiceStarterSpoken.startsWith(`${voiceSessionMarker}.`));
  assert.match(voiceStarterSpoken, /English speaking coach/i);
  assert.match(voiceStarterSpoken, /ask one question at a time/i);
  assert.ok(voiceStarterSpoken.split(/\s+/).length < 70);
});

test("post-voice review prompt carries the complete v1 contract", () => {
  assert.match(reviewPrompt, new RegExp(voiceSessionMarker));
  assert.match(reviewPrompt, /"schemaVersion": "1\.0"/);
  assert.match(reviewPrompt, /只返回一个 fenced json 代码块/);
  assert.match(reviewPrompt, /少于 40/);
  assert.match(reviewPrompt, /少于 3/);
  assert.match(reviewPrompt, new RegExp(fluencyUnassessedReasonZh));
  assert.match(reviewPrompt, new RegExp(pronunciationUnassessedReasonZh));
  for (const ruleId of errorRuleIds) assert.match(reviewPrompt, new RegExp(`\\b${ruleId}\\b`));
});

test("Chat workflow prompt carries no credential-shaped material", () => {
  assert.doesNotMatch(reviewPrompt, /(?:sk-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9]{16,}|Bearer\s+[A-Za-z0-9._-]{16,})/);
  assert.doesNotMatch(voiceStarterSpoken, /token|secret|api[ _-]?key/i);
});

