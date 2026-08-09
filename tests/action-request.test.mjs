import assert from "node:assert/strict";
import test from "node:test";
import {
  maxActionRequestBytes,
  parseActionSaveRequest,
} from "../lib/action-request.mjs";
import { validReview } from "./fixtures/valid-review.mjs";

const validRequest = {
  idempotencyKey: "550e8400-e29b-41d4-a716-446655440000",
  review: validReview,
};

test("accepts one strict, valid Action save request", () => {
  const result = parseActionSaveRequest(JSON.stringify(validRequest));
  assert.equal(result.success, true);
  assert.equal(result.data.review.topicEn, validReview.topicEn);
});

test("rejects malformed JSON and oversized Action bodies", () => {
  const malformed = parseActionSaveRequest("{");
  assert.equal(malformed.success, false);
  assert.equal(malformed.status, 400);
  assert.equal(malformed.error.code, "INVALID_JSON");

  const oversized = parseActionSaveRequest("x".repeat(maxActionRequestBytes + 1));
  assert.equal(oversized.success, false);
  assert.equal(oversized.status, 413);
  assert.equal(oversized.error.code, "REQUEST_TOO_LARGE");
});

test("rejects invented identity, timestamps, and invalid idempotency keys", () => {
  const extra = parseActionSaveRequest(JSON.stringify({
    ...validRequest,
    ownerId: "someone-else",
    savedAt: "2026-08-09T08:00:00.000Z",
  }));
  assert.equal(extra.success, false);
  assert.equal(extra.status, 422);

  const invalidKey = parseActionSaveRequest(JSON.stringify({
    ...validRequest,
    idempotencyKey: "reuse-this",
  }));
  assert.equal(invalidKey.success, false);
  assert.equal(invalidKey.status, 422);
});

test("reuses every semantic guardrail from the review contract", () => {
  const invalidReview = structuredClone(validReview);
  invalidReview.pronunciation = { status: "assessed", reasonZh: "发音很好。" };
  const result = parseActionSaveRequest(JSON.stringify({
    ...validRequest,
    review: invalidReview,
  }));

  assert.equal(result.success, false);
  assert.equal(result.status, 422);
  assert.ok(result.error.fieldErrors.some((issue) => issue.path.startsWith("review.pronunciation")));
});
