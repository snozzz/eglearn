import assert from "node:assert/strict";
import test from "node:test";
import {
  hashReview,
  mergeSessions,
  parseStoredSession,
} from "../lib/session-sync.mjs";
import { validReview } from "./fixtures/valid-review.mjs";

function record(id, importedAt, review = validReview) {
  return { id, importedAt, review: structuredClone(review) };
}

test("hashes equal validated reviews identically", async () => {
  assert.equal(await hashReview(validReview), await hashReview(structuredClone(validReview)));
  assert.match(await hashReview(validReview), /^[a-f0-9]{64}$/);
});

test("merges local and cloud sessions by review content", () => {
  const older = record("local", "2026-08-08T08:00:00.000Z");
  const newer = record("cloud", "2026-08-09T08:00:00.000Z");
  const differentReview = structuredClone(validReview);
  differentReview.topicEn = "Handling a delayed delivery";

  const merged = mergeSessions([older], [newer, record("other", "2026-08-07T08:00:00.000Z", differentReview)]);
  assert.deepEqual(merged.map((session) => session.id), ["cloud", "other"]);
});

test("rejects invalid cached records", () => {
  assert.throws(
    () => parseStoredSession({ id: "bad", importedAt: "not-a-date", review: validReview }),
    /时间无效/,
  );
});
