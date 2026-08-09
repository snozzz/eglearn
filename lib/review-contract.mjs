import { z } from "zod";

export const errorRuleIds = [
  "G_PAST_TENSE",
  "G_PRESENT_PERFECT",
  "G_TENSE_ASPECT_OTHER",
  "G_SUBJECT_VERB_AGREEMENT",
  "G_ARTICLE_MISSING",
  "G_ARTICLE_CHOICE",
  "G_COUNTABILITY",
  "G_PREPOSITION_TIME_PLACE",
  "G_PREPOSITION_COLLOCATION",
  "G_WORD_ORDER",
  "G_PRONOUN_REFERENCE",
  "G_INFINITIVE_GERUND",
  "G_MODAL",
  "G_CONDITIONAL",
  "L_WORD_CHOICE",
  "L_COLLOCATION",
  "L_WORD_FORM",
  "L_REGISTER",
  "L_EXCESSIVE_REPETITION",
  "D_COHESION",
  "D_RELEVANCE",
  "D_CLARIFICATION",
  "D_TURN_DEVELOPMENT",
  "OTHER",
];

export const fluencyUnassessedReasonZh = "当前复盘没有可靠的语音时间证据，因此不评估流利度。";
export const pronunciationUnassessedReasonZh = "文字转录不足以可靠评估发音。";

const errorRuleId = z.enum(errorRuleIds);
const evidence = z.object({ quote: z.string().trim().min(1).max(300) }).strict();

const strength = z.object({
  dimension: z.enum(["grammar", "vocabulary", "communication", "interaction"]),
  noteZh: z.string().trim().min(1).max(500),
  evidence: z.array(evidence).min(1).max(2),
}).strict();

const keyIssue = z.object({
  ruleId: errorRuleId,
  impact: z.enum(["meaning_blocking", "meaning_affecting", "polish"]),
  original: z.string().trim().min(1).max(300),
  rewrite: z.string().trim().min(1).max(300),
  explanationZh: z.string().trim().min(1).max(500),
  practiceCueEn: z.string().trim().min(1).max(300),
}).strict().refine((issue) => issue.original !== issue.rewrite, {
  message: "rewrite must differ from original",
  path: ["rewrite"],
});

const score = z.object({
  status: z.enum(["assessed", "unassessed"]),
  band: z.number().int().min(1).max(5).nullable(),
  basis: z.enum(["transcript", "none"]),
  rationaleZh: z.string().trim().min(1).max(500),
}).strict().superRefine((value, context) => {
  if (value.status === "assessed" && (value.band === null || value.basis !== "transcript")) {
    context.addIssue({ code: "custom", message: "assessed scores require a band and transcript basis" });
  }
  if (value.status === "unassessed" && (value.band !== null || value.basis !== "none")) {
    context.addIssue({ code: "custom", message: "unassessed scores require a null band and no basis" });
  }
});

const alwaysUnassessedScore = z.object({
  status: z.literal("unassessed"),
  band: z.null(),
  basis: z.literal("none"),
  rationaleZh: z.literal(fluencyUnassessedReasonZh),
}).strict();

const usefulExpression = z.object({
  quote: z.string().trim().min(1).max(300),
  whyItWorksZh: z.string().trim().min(1).max(500),
  reusablePatternEn: z.string().trim().min(1).max(300),
}).strict();

export const reviewSchema = z.object({
  schemaVersion: z.literal("1.0"),
  topicEn: z.string().trim().min(1).max(160),
  sample: z.object({
    status: z.enum(["sufficient", "insufficient"]),
    learnerWordCount: z.number().int().min(0).max(100000),
    substantiveTurnCount: z.number().int().min(0).max(10000),
    reasonZh: z.string().trim().min(1).max(300),
  }).strict(),
  summaryZh: z.string().trim().min(1).max(800),
  strengths: z.array(strength).max(3),
  keyIssues: z.array(keyIssue).max(3),
  scores: z.object({
    grammar: score,
    vocabulary: score,
    communication: score,
    fluency: alwaysUnassessedScore,
  }).strict(),
  pronunciation: z.object({
    status: z.literal("not_assessed"),
    reasonZh: z.literal(pronunciationUnassessedReasonZh),
  }).strict(),
  usefulExpressions: z.array(usefulExpression).max(3),
  nextPractice: z.object({
    focusRuleIds: z.array(errorRuleId).max(2),
    scenarioEn: z.string().trim().min(1).max(300),
    promptsEn: z.array(z.string().trim().min(1).max(300)).min(2).max(3),
    retrySentenceEn: z.string().trim().min(1).max(300).nullable(),
  }).strict(),
}).strict().superRefine((review, context) => {
  const issueIds = review.keyIssues.map((issue) => issue.ruleId);
  if (new Set(issueIds).size !== issueIds.length) {
    context.addIssue({ code: "custom", message: "keyIssues must use unique ruleIds", path: ["keyIssues"] });
  }

  const focusIds = review.nextPractice.focusRuleIds;
  if (new Set(focusIds).size !== focusIds.length) {
    context.addIssue({ code: "custom", message: "focusRuleIds must be unique", path: ["nextPractice", "focusRuleIds"] });
  }
  for (const ruleId of focusIds) {
    if (!issueIds.includes(ruleId)) {
      context.addIssue({
        code: "custom",
        message: "focusRuleIds must come from this review's keyIssues",
        path: ["nextPractice", "focusRuleIds"],
      });
    }
  }

  if (review.sample.status === "insufficient") {
    for (const dimension of ["grammar", "vocabulary", "communication"]) {
      if (review.scores[dimension].status !== "unassessed") {
        context.addIssue({
          code: "custom",
          message: "insufficient samples cannot receive assessed scores",
          path: ["scores", dimension],
        });
      }
    }
  }

  const meetsMinimumSample =
    review.sample.learnerWordCount >= 40 && review.sample.substantiveTurnCount >= 3;
  if (review.sample.status === "sufficient" && !meetsMinimumSample) {
    context.addIssue({
      code: "custom",
      message: "sufficient samples require at least 40 learner words and 3 substantive turns",
      path: ["sample"],
    });
  }
  if (review.sample.status === "insufficient" && meetsMinimumSample) {
    context.addIssue({
      code: "custom",
      message: "samples meeting both minimums cannot be marked insufficient",
      path: ["sample"],
    });
  }

  if (review.keyIssues.length === 0) {
    if (focusIds.length !== 0 || review.nextPractice.retrySentenceEn !== null) {
      context.addIssue({
        code: "custom",
        message: "reviews without keyIssues require no focusRuleIds and a null retrySentenceEn",
        path: ["nextPractice"],
      });
    }
  } else {
    const focusedIssue = review.keyIssues.find((issue) => issue.ruleId === focusIds[0]);
    if (!focusedIssue || review.nextPractice.retrySentenceEn !== focusedIssue.rewrite) {
      context.addIssue({
        code: "custom",
        message: "retrySentenceEn must equal the rewrite for the first focused issue",
        path: ["nextPractice", "retrySentenceEn"],
      });
    }
  }

  const generatedCommentary = [
    review.sample.reasonZh,
    review.summaryZh,
    ...review.strengths.map((item) => item.noteZh),
    ...review.keyIssues.map((item) => item.explanationZh),
    review.scores.grammar.rationaleZh,
    review.scores.vocabulary.rationaleZh,
    review.scores.communication.rationaleZh,
    review.scores.fluency.rationaleZh,
    review.pronunciation.reasonZh,
    ...review.usefulExpressions.map((item) => item.whyItWorksZh),
  ];
  const unsupportedClaim = /(?:\b(?:A1|A2|B1|B2|C1|C2)\b|\d{1,3}\s*%|总分|连续\s*\d+\s*天|重复(?:出现)?\s*\d+\s*次|\b[0-5]\s*\/\s*5\b)/i;
  if (generatedCommentary.some((text) => unsupportedClaim.test(text))) {
    context.addIssue({
      code: "custom",
      message: "generated commentary contains an unsupported level, percentage, streak, or recurrence claim",
      path: ["summaryZh"],
    });
  }
});

export function parseReviewText(text) {
  const trimmed = text.trim();
  if (trimmed.length > 65_536) {
    return { success: false, errors: ["复盘内容超过 64 KiB。请只复制单个 JSON 代码块。"] };
  }
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const payload = fenced ? fenced[1] : trimmed;

  let input;
  try {
    input = JSON.parse(payload);
  } catch {
    return { success: false, errors: ["复盘不是有效 JSON。请只复制 GPT 输出的 JSON 代码块。"] };
  }

  const result = reviewSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };

  return {
    success: false,
    errors: result.error.issues.map((issue) => {
      const location = issue.path.length ? issue.path.join(".") : "review";
      return `${location}: ${issue.message}`;
    }),
  };
}
