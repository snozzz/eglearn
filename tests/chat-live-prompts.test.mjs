import assert from "node:assert/strict";
import test from "node:test";
import {
  reviewPrompt,
  voiceSessionMarker,
  voiceStarterSpoken,
} from "../lib/chat-live-prompts.mjs";
import {
  errorRuleIds,
  audioEvidenceUnavailableReasonZh,
} from "../lib/review-contract.mjs";

test("voice starter creates a stable spoken session boundary", () => {
  assert.ok(voiceStarterSpoken.startsWith(`${voiceSessionMarker}.`));
  assert.match(voiceStarterSpoken, /English speaking coach/i);
  assert.match(voiceStarterSpoken, /ask one question at a time/i);
  assert.match(voiceStarterSpoken, /Every 4 to 6 substantive learner turns/i);
  assert.match(voiceStarterSpoken, /EGLearn live checkpoint/i);
  assert.match(voiceStarterSpoken, /EGLearn oral recap/i);
  assert.match(voiceStarterSpoken, /naturalness/i);
  assert.match(voiceStarterSpoken, /directly hear/i);
  assert.match(voiceStarterSpoken, /WPM/i);
});

test("post-voice review prompt carries the complete deep-review contract", () => {
  assert.match(reviewPrompt, new RegExp(voiceSessionMarker));
  assert.match(reviewPrompt, /"schemaVersion": "1\.1"/);
  assert.match(reviewPrompt, /只返回一个 fenced json 代码块/);
  assert.match(reviewPrompt, /少于 40/);
  assert.match(reviewPrompt, /少于 3/);
  assert.match(reviewPrompt, /6–12 个最高价值问题/);
  assert.match(reviewPrompt, /分段/);
  assert.match(reviewPrompt, new RegExp(audioEvidenceUnavailableReasonZh));
  assert.match(reviewPrompt, /liveCorrections/);
  assert.match(reviewPrompt, /liveCheckpoints/);
  assert.match(reviewPrompt, /live_checkpoint/);
  for (const ruleId of errorRuleIds) assert.match(reviewPrompt, new RegExp(`\\b${ruleId}\\b`));
});

test("Chat workflow prompt carries no credential-shaped material", () => {
  assert.doesNotMatch(reviewPrompt, /(?:sk-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9]{16,}|Bearer\s+[A-Za-z0-9._-]{16,})/);
  assert.doesNotMatch(voiceStarterSpoken, /token|secret|api[ _-]?key/i);
});
