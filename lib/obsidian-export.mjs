import { stringify } from "yaml";

const managedStart = "<!-- egl:managed:start -->";
const managedEnd = "<!-- egl:managed:end -->";

function safeBlock(value) {
  return String(value)
    .replaceAll("\0", "")
    .replaceAll("<!--", "&lt;!--")
    .replaceAll("-->", "--&gt;")
    .trim();
}

function safeInline(value) {
  return safeBlock(value).replace(/\s+/g, " ").replaceAll("|", "\\|");
}

function dateParts(isoDate, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return Object.fromEntries(
    formatter.formatToParts(new Date(isoDate))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
}

function scoreTable(review) {
  const labels = {
    grammar: "Grammar",
    vocabulary: "Vocabulary",
    communication: "Communication",
    fluency: "Fluency",
  };
  const rows = Object.entries(labels).map(([key, label]) => {
    const score = review.scores[key];
    return `| ${label} | ${score.band ?? "Not assessed"} | ${safeInline(score.rationaleZh)} |`;
  });
  return ["| Dimension | Band | Basis |", "| --- | ---: | --- |", ...rows].join("\n");
}

function renderManaged(record) {
  const review = record.review;
  const strengths = review.strengths.length
    ? review.strengths.map((item) => [
      `- ${safeBlock(item.noteZh)}`,
      ...item.evidence.map((itemEvidence) => `  - Evidence supplied by GPT: “${safeBlock(itemEvidence.quote)}”`),
    ].join("\n")).join("\n")
    : "No strengths were recorded because the sample was insufficient.";
  const issues = review.keyIssues.length
    ? review.keyIssues.map((issue, index) => [
      `### ${index + 1}. ${safeInline(issue.ruleId)}`,
      `- Original supplied by GPT: ~~${safeBlock(issue.original)}~~`,
      `- Minimal rewrite: **${safeBlock(issue.rewrite)}**`,
      `- Why: ${safeBlock(issue.explanationZh)}`,
      `- Practice cue: ${safeBlock(issue.practiceCueEn)}`,
    ].join("\n")).join("\n\n")
    : "No high-confidence issue was recorded for this sample.";
  const expressions = review.usefulExpressions.length
    ? review.usefulExpressions.map((item) => [
      `- **${safeBlock(item.quote)}**`,
      `  - ${safeBlock(item.whyItWorksZh)}`,
      `  - Pattern: \`${safeBlock(item.reusablePatternEn).replaceAll("`", "\\`")}\``,
    ].join("\n")).join("\n")
    : "No reusable expression was recorded.";
  const retry = review.nextPractice.retrySentenceEn
    ? `\n\nRetry sentence: **${safeBlock(review.nextPractice.retrySentenceEn)}**`
    : "";

  return [
    managedStart,
    "",
    "## Summary",
    "",
    safeBlock(review.summaryZh),
    "",
    "## Sample",
    "",
    `- Learner words: ${review.sample.learnerWordCount}`,
    `- Substantive turns: ${review.sample.substantiveTurnCount}`,
    `- Sufficiency: ${review.sample.status}`,
    "",
    "## Scores",
    "",
    scoreTable(review),
    "",
    "## What went well",
    "",
    strengths,
    "",
    "## Priority fixes",
    "",
    issues,
    "",
    "## Useful expressions",
    "",
    expressions,
    "",
    "## Tomorrow",
    "",
    safeBlock(review.nextPractice.scenarioEn),
    "",
    ...review.nextPractice.promptsEn.map((prompt) => `- ${safeBlock(prompt)}`),
    retry,
    "",
    "## Assessment boundaries",
    "",
    `- Fluency: ${safeBlock(review.scores.fluency.rationaleZh)}`,
    `- Pronunciation: ${safeBlock(review.pronunciation.reasonZh)}`,
    "- Quotes are supplied by the GPT and were structurally validated, not matched against an independently imported transcript.",
    "",
    managedEnd,
  ].join("\n");
}

async function managedHash(content) {
  const normalized = content
    .replace(managedStart, "")
    .replace(managedEnd, "")
    .replaceAll("\r\n", "\n")
    .trim();
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalized));
  return `sha256:${[...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function sessionMarkdownFilename(record, timeZone = "UTC") {
  const parts = dateParts(record.importedAt, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}_${parts.hour}-${parts.minute}_${record.id}.md`;
}

export async function renderSessionMarkdown(record, options = {}) {
  const timeZone = options.timeZone ?? "UTC";
  const parts = dateParts(record.importedAt, timeZone);
  const managed = renderManaged(record);
  const frontmatter = {
    eglearn_schema: 1,
    eglearn_type: "speaking-session",
    eglearn_session_id: record.id,
    eglearn_revision: 1,
    eglearn_rubric_version: 1,
    eglearn_date: `${parts.year}-${parts.month}-${parts.day}`,
    eglearn_imported_at: record.importedAt,
    eglearn_timezone: timeZone,
    eglearn_language: "en",
    eglearn_topic: safeBlock(record.review.topicEn),
    ...(record.review.scores.grammar.band === null ? {} : { eglearn_score_grammar: record.review.scores.grammar.band }),
    ...(record.review.scores.vocabulary.band === null ? {} : { eglearn_score_vocabulary: record.review.scores.vocabulary.band }),
    ...(record.review.scores.communication.band === null ? {} : { eglearn_score_communication: record.review.scores.communication.band }),
    eglearn_managed_hash: await managedHash(managed),
    tags: ["eglearn/speaking", "english/practice"],
  };

  return [
    "---",
    stringify(frontmatter, { lineWidth: 0 }).trim(),
    "---",
    "",
    `# Speaking practice — ${safeInline(record.review.topicEn)}`,
    "",
    managed,
    "",
    "## My notes",
    "",
  ].join("\n");
}

export function normalizeObsidianFolder(value = "EGLearn/Speaking Sessions") {
  const segments = value.replaceAll("\\", "/").split("/").filter(Boolean);
  if (segments.length === 0 || segments.some((segment) => segment === "." || segment === "..")) {
    throw new Error("Obsidian 目标目录不能为空，也不能包含 . 或 .. 路径段。");
  }
  return segments.join("/");
}

export function buildObsidianNewUri({ vault, folder, filename }) {
  const vaultName = vault.trim();
  if (!vaultName) throw new Error("请先填写 Obsidian Vault 名称或 ID。");
  const path = `${normalizeObsidianFolder(folder)}/${filename}`;
  return `obsidian://new?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(path)}&clipboard`;
}
