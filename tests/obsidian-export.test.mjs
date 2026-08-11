import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "yaml";
import {
  buildObsidianNewUri,
  normalizeObsidianFolder,
  renderSessionMarkdown,
  sessionMarkdownFilename,
} from "../lib/obsidian-export.mjs";
import { validReview } from "./fixtures/valid-review.mjs";
import { validReviewV11 } from "./fixtures/valid-review-v11.mjs";

const record = {
  id: "01K1ABCDEF1234567890XYZAB",
  importedAt: "2026-08-06T12:34:12.000Z",
  review: validReview,
};

function frontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(match, "export must start with YAML frontmatter");
  return parse(match[1]);
}

test("renders deterministic Obsidian Markdown with typed frontmatter", async () => {
  const first = await renderSessionMarkdown(record, { timeZone: "Asia/Shanghai" });
  const second = await renderSessionMarkdown(record, { timeZone: "Asia/Shanghai" });
  const properties = frontmatter(first);

  assert.equal(first, second);
  assert.equal(properties.eglearn_session_id, record.id);
  assert.equal(properties.eglearn_date, "2026-08-06");
  assert.equal(properties.eglearn_score_grammar, 3);
  assert.equal(typeof properties.eglearn_score_grammar, "number");
  assert.match(properties.eglearn_managed_hash, /^sha256:[a-f0-9]{64}$/);
  assert.match(first, /<!-- egl:managed:start -->/);
  assert.match(first, /<!-- egl:managed:end -->/);
  assert.match(first, /## My notes\n$/);
  assert.match(first, /structurally validated, not matched/);
});

test("uses a stable cross-platform filename in the chosen timezone", () => {
  assert.equal(
    sessionMarkdownFilename(record, "Asia/Shanghai"),
    `2026-08-06_20-34_${record.id}.md`,
  );
  assert.doesNotMatch(sessionMarkdownFilename(record), /:/);
});

test("serializes hostile topic text without breaking YAML or managed markers", async () => {
  const hostile = structuredClone(record);
  hostile.review = structuredClone(validReview);
  hostile.review.topicEn = "Travel: check-in\n<!-- egl:managed:end -->";
  hostile.review.summaryZh = "Keep going <!-- egl:managed:start -->";
  const markdown = await renderSessionMarkdown(hostile, { timeZone: "UTC" });
  const properties = frontmatter(markdown);

  assert.equal(properties.eglearn_topic, "Travel: check-in\n&lt;!-- egl:managed:end --&gt;");
  assert.equal(markdown.match(/<!-- egl:managed:start -->/g).length, 1);
  assert.equal(markdown.match(/<!-- egl:managed:end -->/g).length, 1);
  assert.match(markdown, /&lt;!-- egl:managed:end --&gt;/);
});

test("exports v1.1 oral observations and segment drills", async () => {
  const markdown = await renderSessionMarkdown({ ...record, review: validReviewV11 }, { timeZone: "UTC" });
  assert.match(markdown, /## Oral analysis/);
  assert.match(markdown, /reliability/);
  assert.match(markdown, /Live corrections/);
  assert.match(markdown, /## Segment review/);
  assert.match(markdown, /Project decision/);
  assert.match(markdown, /Drill:/);
});

test("builds an encoded clipboard URI without destructive flags", () => {
  const uri = buildObsidianNewUri({
    vault: "My English Vault",
    folder: "EGLearn\\Speaking Sessions",
    filename: sessionMarkdownFilename(record, "UTC"),
  });

  assert.match(uri, /^obsidian:\/\/new\?/);
  assert.match(uri, /vault=My%20English%20Vault/);
  assert.match(uri, /file=EGLearn%2FSpeaking%20Sessions%2F/);
  assert.match(uri, /&clipboard$/);
  assert.doesNotMatch(uri, /append|overwrite|silent|content=/);
});

test("rejects ambiguous vault paths", () => {
  assert.throws(() => normalizeObsidianFolder("../Notes"), /不能包含/);
  assert.throws(
    () => buildObsidianNewUri({ vault: " ", folder: "EGLearn", filename: "note.md" }),
    /填写 Obsidian Vault/,
  );
});
