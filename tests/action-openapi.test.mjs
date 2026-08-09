import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { z } from "zod";
import YAML from "yaml";
import { reviewSchema } from "../lib/review-contract.mjs";

const source = await readFile(new URL("../gpt/ACTION_OPENAPI.yaml", import.meta.url), "utf8");
const schema = YAML.parse(source);

test("defines one HTTPS, write-only GPT Action", () => {
  assert.equal(schema.openapi, "3.1.0");
  assert.deepEqual(Object.keys(schema.paths), ["/api/actions/reviews"]);
  assert.equal(schema.paths["/api/actions/reviews"].post.operationId, "saveSpeakingReview");
  assert.match(schema.servers[0].url, /^https:\/\//);
  assert.equal(schema.components.securitySchemes.sitesAuthorization.name, "OAI-Sites-Authorization");
});

test("keeps the generated Action review schema aligned with Zod", () => {
  const expected = z.toJSONSchema(reviewSchema);
  delete expected.$schema;
  assert.deepEqual(schema.components.schemas.ReviewV1, expected);
});

test("does not contain an Action credential", () => {
  assert.doesNotMatch(source, /OAI-Sites-Authorization\s*:\s*(?:Bearer\s+)?[A-Za-z0-9._~-]{32,}/i);
  assert.doesNotMatch(source, /Bearer\s+[A-Za-z0-9._~-]{32,}/i);
});
