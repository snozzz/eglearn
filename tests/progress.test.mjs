import assert from "node:assert/strict";
import test from "node:test";
import { buildProgress } from "../lib/progress.mjs";
import { validReview } from "./fixtures/valid-review.mjs";

function session(id, day, changes = {}) {
  const review = structuredClone(validReview);
  Object.assign(review, changes);
  return { id, importedAt: `2026-08-0${day}T12:00:00.000Z`, review };
}

test("aggregates controlled issues once per distinct session", () => {
  const first = session("one", 1);
  const secondReview = structuredClone(validReview);
  secondReview.topicEn = "A delayed train";
  secondReview.keyIssues[0].original = "Yesterday the train leave late.";
  secondReview.keyIssues[0].rewrite = "Yesterday the train left late.";
  secondReview.nextPractice.retrySentenceEn = secondReview.keyIssues[0].rewrite;
  secondReview.scores.grammar.band = 4;
  const second = { id: "two", importedAt: "2026-08-02T12:00:00.000Z", review: secondReview };

  const progress = buildProgress([second, first, first]);
  assert.equal(progress.totalSessions, 2, "duplicate session IDs must be idempotent");
  assert.equal(progress.totalLearnerWords, 172);
  assert.equal(progress.issueStats[0].ruleId, "G_PAST_TENSE");
  assert.equal(progress.issueStats[0].sessionCount, 2);
  assert.equal(progress.issueStats[0].status, "repeated");
  assert.equal(progress.repeatedIssueCount, 1);
});

test("marks an issue frequent only after four distinct sessions", () => {
  const sessions = [1, 2, 3, 4].map((day) => session(`session-${day}`, day));
  const progress = buildProgress(sessions);
  assert.equal(progress.issueStats[0].status, "frequent");
  assert.equal(progress.issueStats[0].sessionCount, 4);
});

test("does not aggregate OTHER across sessions", () => {
  const first = session("one", 1);
  first.review.keyIssues[0].ruleId = "OTHER";
  first.review.nextPractice.focusRuleIds = ["OTHER"];
  const second = structuredClone(first);
  second.id = "two";
  second.importedAt = "2026-08-02T12:00:00.000Z";
  const progress = buildProgress([first, second]);
  assert.deepEqual(progress.issueStats, []);
  assert.deepEqual(progress.comparisons, []);
});

test("builds score trends without percentages or unassessed points", () => {
  const first = session("one", 1);
  const second = session("two", 2);
  second.review.scores.grammar.band = 4;
  second.review.scores.vocabulary = {
    status: "unassessed",
    band: null,
    basis: "none",
    rationaleZh: "样本不足，暂不评分。",
  };
  const progress = buildProgress([first, second]);
  assert.deepEqual(progress.scoreTrends.grammar.points.map((point) => point.band), [3, 4]);
  assert.equal(progress.scoreTrends.grammar.latestDelta, 1);
  assert.equal(progress.scoreTrends.vocabulary.points.length, 1);
});

test("compares the latest two appearances without claiming mastery", () => {
  const first = session("one", 1);
  const second = session("two", 2);
  second.review.keyIssues[0].original = "Last week we finish it.";
  second.review.keyIssues[0].rewrite = "Last week we finished it.";
  second.review.nextPractice.retrySentenceEn = second.review.keyIssues[0].rewrite;
  const comparison = buildProgress([first, second]).comparisons[0];
  assert.equal(comparison.previous.original, "Yesterday we finish the first test.");
  assert.equal(comparison.latest.original, "Last week we finish it.");
  assert.equal("mastered" in comparison, false);
});
