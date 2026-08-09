import assert from "node:assert/strict";
import test from "node:test";
import { IDBFactory } from "fake-indexeddb";
import {
  clearSessions,
  createSessionId,
  listSessions,
  putSessionRecord,
  replaceSessions,
  saveSession,
} from "../lib/session-store.mjs";
import { validReview } from "./fixtures/valid-review.mjs";

test("creates stable-format sortable session IDs", () => {
  const zero = new Uint8Array(10);
  const earlier = createSessionId(1000, zero);
  const later = createSessionId(2000, zero);

  assert.match(earlier, /^[0-9A-HJKMNP-TV-Z]{26}$/);
  assert.ok(earlier < later);
  assert.throws(() => createSessionId(-1, zero), /non-negative timestamp/);
});

test("persists validated sessions and lists newest first", async () => {
  const indexedDB = new IDBFactory();
  const first = await saveSession(validReview, {
    indexedDB,
    now: Date.UTC(2026, 7, 5, 12),
    randomBytes: new Uint8Array(10),
  });
  const secondReview = structuredClone(validReview);
  secondReview.topicEn = "Handling a hotel problem";
  const second = await saveSession(secondReview, {
    indexedDB,
    now: Date.UTC(2026, 7, 6, 12),
    randomBytes: new Uint8Array(10).fill(1),
  });

  const sessions = await listSessions({ indexedDB });
  assert.equal(sessions.length, 2);
  assert.equal(sessions[0].id, second.id);
  assert.equal(sessions[1].id, first.id);
  assert.equal(sessions[0].review.topicEn, "Handling a hotel problem");
});

test("refuses to persist a review that bypasses the import parser", async () => {
  const invalid = structuredClone(validReview);
  invalid.pronunciation = { status: "assessed", reasonZh: "发音很好。" };

  await assert.rejects(
    saveSession(invalid, { indexedDB: new IDBFactory() }),
    /Invalid input/,
  );
});

test("clears all local sessions only when explicitly called", async () => {
  const indexedDB = new IDBFactory();
  await saveSession(validReview, { indexedDB, now: 1000, randomBytes: new Uint8Array(10) });
  assert.equal((await listSessions({ indexedDB })).length, 1);

  await clearSessions({ indexedDB });
  assert.deepEqual(await listSessions({ indexedDB }), []);
});

test("caches validated cloud records without changing their identity", async () => {
  const indexedDB = new IDBFactory();
  const record = {
    id: "server-session-id",
    importedAt: "2026-08-09T08:00:00.000Z",
    review: validReview,
  };

  await putSessionRecord(record, { indexedDB });
  assert.deepEqual(await listSessions({ indexedDB }), [record]);
});

test("atomically replaces the local cache with validated records", async () => {
  const indexedDB = new IDBFactory();
  await saveSession(validReview, { indexedDB, now: 1000, randomBytes: new Uint8Array(10) });
  const replacement = {
    id: "cloud-record",
    importedAt: "2026-08-09T09:00:00.000Z",
    review: { ...validReview, topicEn: "Checking into a hotel" },
  };

  await replaceSessions([replacement], { indexedDB });
  assert.deepEqual(await listSessions({ indexedDB }), [replacement]);
});
