import assert from "node:assert/strict";
import test from "node:test";
import {
  deleteCloudSessions,
  fetchCloudSessions,
  saveCloudReview,
} from "../lib/cloud-client.mjs";
import { validReview } from "./fixtures/valid-review.mjs";

const record = {
  id: "cloud-session",
  importedAt: "2026-08-09T09:00:00.000Z",
  review: validReview,
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("reads and validates cloud sessions", async () => {
  const calls = [];
  const sessions = await fetchCloudSessions(async (...args) => {
    calls.push(args);
    return jsonResponse({ sessions: [record] });
  });

  assert.deepEqual(sessions, [record]);
  assert.equal(calls[0][0], "/api/sessions");
  assert.equal(calls[0][1].cache, "no-store");
});

test("saves a review and validates the returned record", async () => {
  let request;
  const result = await saveCloudReview(validReview, async (...args) => {
    request = args;
    return jsonResponse({ status: "saved", session: record });
  });

  assert.equal(result.status, "saved");
  assert.equal(request[1].method, "POST");
  assert.deepEqual(JSON.parse(request[1].body), { review: validReview });
});

test("surfaces controlled cloud errors", async () => {
  await assert.rejects(
    fetchCloudSessions(async () => jsonResponse({ error: "请先登录。" }, 401)),
    /请先登录/,
  );
  await assert.rejects(
    deleteCloudSessions(async () => jsonResponse({ error: "暂时失败。" }, 503)),
    /暂时失败/,
  );
});
