import assert from "node:assert/strict";
import test from "node:test";
import {
  checkpointLabel,
  checkpointTemplateSpoken,
  checkpointTriggerSpoken,
  oralRecapLabel,
  oralRecapTemplateSpoken,
  projectInstructions,
  reviewPrompt,
  voiceSessionMarker,
  voiceStarterShortSpoken,
  voiceStarterSpoken,
} from "../lib/chat-live-prompts.mjs";
import {
  errorRuleIds,
  audioEvidenceUnavailableReasonZh,
} from "../lib/review-contract.mjs";

test("resident project instructions carry the whole coaching protocol", () => {
  assert.match(projectInstructions, /English speaking coach/i);
  assert.match(projectInstructions, /ask one question at a time/i);
  assert.match(projectInstructions, new RegExp(voiceSessionMarker));
  assert.match(projectInstructions, new RegExp(checkpointTriggerSpoken.replace(/[.,]/g, "\\$&")));
  assert.ok(projectInstructions.includes(checkpointTemplateSpoken));
  assert.ok(projectInstructions.includes(oralRecapTemplateSpoken));
  assert.match(projectInstructions, /at most five checkpoints yourself/i);
  assert.match(projectInstructions, /directly heard/i);
  assert.match(projectInstructions, /WPM/);
  // The protocol must not itself become the practice: no text may be sent before Voice.
  assert.match(projectInstructions, /never have to read them aloud/i);
});

test("short spoken starter keeps the session boundary without repeating the protocol", () => {
  assert.ok(voiceStarterShortSpoken.startsWith(`${voiceSessionMarker}.`));
  assert.match(voiceStarterShortSpoken, /EGLearn checkpoint rules/i);
  assert.ok(voiceStarterShortSpoken.length < 260);
  assert.ok(!voiceStarterShortSpoken.includes(checkpointTemplateSpoken));
});

test("full spoken starter stays available as the no-project fallback", () => {
  assert.ok(voiceStarterSpoken.startsWith(`${voiceSessionMarker}.`));
  assert.match(voiceStarterSpoken, /English speaking coach/i);
  assert.match(voiceStarterSpoken, /ask one question at a time/i);
  assert.ok(voiceStarterSpoken.includes(checkpointTemplateSpoken));
  assert.ok(voiceStarterSpoken.includes(oralRecapTemplateSpoken));
  assert.match(voiceStarterSpoken, new RegExp(checkpointTriggerSpoken.replace(/[.,]/g, "\\$&")));
  assert.match(voiceStarterSpoken, /naturalness/i);
  assert.match(voiceStarterSpoken, /WPM/);
});

test("spoken checkpoint template matches the stored contract vocabulary", () => {
  assert.ok(checkpointTemplateSpoken.startsWith(checkpointLabel));
  assert.ok(oralRecapTemplateSpoken.startsWith(oralRecapLabel));
  for (const field of ["Target:", "Model:", "Repeat:", "Result:"]) {
    assert.ok(checkpointTemplateSpoken.includes(field), `template must include ${field}`);
  }
  for (const outcome of ["improved after repeat", "needs more repetition", "not verified", "observation only"]) {
    assert.ok(checkpointTemplateSpoken.includes(outcome), `template must include ${outcome}`);
  }
});

test("review prompt maps the spoken template onto contract fields", () => {
  assert.ok(reviewPrompt.includes(checkpointTemplateSpoken));
  assert.match(reviewPrompt, /improved after repeat→improved_after_repeat/);
  assert.match(reviewPrompt, /needs more repetition→needs_more_repetition/);
  assert.match(reviewPrompt, /not verified→not_verified/);
  assert.match(reviewPrompt, /observation only→observation_only/);
  assert.match(reviewPrompt, /学习者主动要求的 checkpoint/);
  assert.match(reviewPrompt, /仍要收录/);
  assert.match(reviewPrompt, new RegExp(`${oralRecapLabel.replace(/[[\]]/g, "\\$&")} 的 Pronunciation`));
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
  for (const text of [voiceStarterSpoken, voiceStarterShortSpoken, projectInstructions]) {
    assert.doesNotMatch(text, /token|secret|api[ _-]?key/i);
  }
});
