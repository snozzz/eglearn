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
export const audioEvidenceUnavailableReasonZh = "当前复盘没有可核对的音频证据，因此不判断发音或流利度。";

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

const scoreV11 = z.object({
  status: z.enum(["assessed", "unassessed"]),
  band: z.number().int().min(1).max(5).nullable(),
  basis: z.enum(["transcript", "audio", "live_checkpoint", "none"]),
  rationaleZh: z.string().trim().min(1).max(800),
}).strict().superRefine((value, context) => {
  if (value.status === "assessed" && (value.band === null || value.basis === "none")) {
    context.addIssue({ code: "custom", message: "assessed scores require a band and evidence basis" });
  }
  if (value.status === "unassessed" && (value.band !== null || value.basis !== "none")) {
    context.addIssue({ code: "custom", message: "unassessed scores require a null band and no basis" });
  }
});

const pronunciationObservation = z.object({
  wordEn: z.string().trim().min(1).max(120),
  targetEn: z.string().trim().min(1).max(120),
  issueZh: z.string().trim().min(1).max(360),
  cueEn: z.string().trim().min(1).max(260),
  confidence: z.enum(["high", "medium"]),
}).strict();

const fluencySignal = z.object({
  dimension: z.enum(["pace", "pausing", "self_correction", "turn_taking"]),
  observationZh: z.string().trim().min(1).max(360),
}).strict();

const liveCorrection = z.object({
  targetEn: z.string().trim().min(1).max(120),
  cueEn: z.string().trim().min(1).max(260),
  outcome: z.enum(["improved_after_repeat", "needs_more_repetition", "not_verified"]),
}).strict();

const liveCheckpoint = z.object({
  dimension: z.enum(["pronunciation", "fluency", "naturalness", "grammar", "vocabulary", "communication"]),
  observationZh: z.string().trim().min(1).max(500),
  targetEn: z.string().trim().max(160).nullable(),
  coachCueEn: z.string().trim().max(320).nullable(),
  learnerRepeatEn: z.string().trim().max(320).nullable(),
  outcome: z.enum(["improved_after_repeat", "needs_more_repetition", "not_verified", "observation_only"]),
}).strict();

const oralAnalysisV11 = z.object({
  evidenceMode: z.enum(["audio", "live_checkpoint", "not_available"]),
  confidence: z.enum(["high", "medium", "low"]),
  summaryZh: z.string().trim().min(1).max(1000),
  pronunciation: z.object({
    status: z.enum(["assessed", "unassessed"]),
    summaryZh: z.string().trim().min(1).max(800),
    observations: z.array(pronunciationObservation).max(8),
  }).strict(),
  fluency: z.object({
    status: z.enum(["assessed", "unassessed"]),
    band: z.number().int().min(1).max(5).nullable(),
    summaryZh: z.string().trim().min(1).max(800),
    signals: z.array(fluencySignal).max(8),
  }).strict(),
  liveCorrections: z.array(liveCorrection).max(8),
  liveCheckpoints: z.array(liveCheckpoint).max(8).optional(),
}).strict();

const segmentV11 = z.object({
  titleEn: z.string().trim().min(1).max(160),
  learnerGoalZh: z.string().trim().min(1).max(360),
  evidence: z.array(evidence).min(1).max(3),
  observationZh: z.string().trim().min(1).max(500),
  improvedResponseEn: z.string().trim().min(1).max(360),
  drillPromptEn: z.string().trim().min(1).max(300),
}).strict();

export const reviewSchemaV11 = z.object({
  schemaVersion: z.literal("1.1"),
  topicEn: z.string().trim().min(1).max(160),
  sample: z.object({
    status: z.enum(["sufficient", "insufficient"]),
    learnerWordCount: z.number().int().min(0).max(100000),
    substantiveTurnCount: z.number().int().min(0).max(10000),
    reasonZh: z.string().trim().min(1).max(300),
  }).strict(),
  summaryZh: z.string().trim().min(1).max(1200),
  strengths: z.array(strength).max(8),
  keyIssues: z.array(keyIssue).max(12),
  scores: z.object({
    grammar: scoreV11,
    vocabulary: scoreV11,
    communication: scoreV11,
    fluency: scoreV11,
  }).strict(),
  pronunciation: z.object({
    status: z.enum(["assessed", "unassessed"]),
    reasonZh: z.string().trim().min(1).max(800),
  }).strict(),
  usefulExpressions: z.array(usefulExpression).max(8),
  segments: z.array(segmentV11).max(8),
  oralAnalysis: oralAnalysisV11,
  nextPractice: z.object({
    focusRuleIds: z.array(errorRuleId).max(4),
    scenarioEn: z.string().trim().min(1).max(360),
    promptsEn: z.array(z.string().trim().min(1).max(360)).min(2).max(5),
    retrySentenceEn: z.string().trim().min(1).max(360).nullable(),
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
      context.addIssue({ code: "custom", message: "focusRuleIds must come from this review's keyIssues", path: ["nextPractice", "focusRuleIds"] });
    }
  }

  if (review.sample.status === "insufficient") {
    for (const dimension of ["grammar", "vocabulary", "communication"]) {
      if (review.scores[dimension].status !== "unassessed") {
        context.addIssue({ code: "custom", message: "insufficient samples cannot receive assessed scores", path: ["scores", dimension] });
      }
    }
  }

  const meetsMinimumSample = review.sample.learnerWordCount >= 40 && review.sample.substantiveTurnCount >= 3;
  if (review.sample.status === "sufficient" && !meetsMinimumSample) {
    context.addIssue({ code: "custom", message: "sufficient samples require at least 40 learner words and 3 substantive turns", path: ["sample"] });
  }
  if (review.sample.status === "insufficient" && meetsMinimumSample) {
    context.addIssue({ code: "custom", message: "samples meeting both minimums cannot be marked insufficient", path: ["sample"] });
  }

  if (review.scores.grammar.status === "assessed" && review.scores.grammar.basis !== "transcript") {
    context.addIssue({ code: "custom", message: "grammar scores require transcript basis", path: ["scores", "grammar"] });
  }
  if (review.scores.vocabulary.status === "assessed" && review.scores.vocabulary.basis !== "transcript") {
    context.addIssue({ code: "custom", message: "vocabulary scores require transcript basis", path: ["scores", "vocabulary"] });
  }
  if (review.scores.communication.status === "assessed" && review.scores.communication.basis !== "transcript") {
    context.addIssue({ code: "custom", message: "communication scores require transcript basis", path: ["scores", "communication"] });
  }

  const hasVoiceEvidence = ["audio", "live_checkpoint"].includes(review.oralAnalysis.evidenceMode);
  const liveCheckpoints = review.oralAnalysis.liveCheckpoints ?? [];
  if (!hasVoiceEvidence) {
    if (review.pronunciation.reasonZh !== audioEvidenceUnavailableReasonZh) {
      context.addIssue({ code: "custom", message: "transcript-only reviews must state the audio evidence boundary", path: ["pronunciation", "reasonZh"] });
    }
    if (review.pronunciation.status !== "unassessed" || review.oralAnalysis.pronunciation.status !== "unassessed" || review.oralAnalysis.pronunciation.observations.length > 0) {
      context.addIssue({ code: "custom", message: "pronunciation needs direct audio evidence", path: ["oralAnalysis", "pronunciation"] });
    }
    if (review.scores.fluency.status !== "unassessed" || review.oralAnalysis.fluency.status !== "unassessed" || review.oralAnalysis.fluency.signals.length > 0) {
      context.addIssue({ code: "custom", message: "fluency needs direct audio evidence", path: ["oralAnalysis", "fluency"] });
    }
    if (liveCheckpoints.length > 0) {
      context.addIssue({ code: "custom", message: "live checkpoints require Voice evidence", path: ["oralAnalysis", "liveCheckpoints"] });
    }
  }
  if (hasVoiceEvidence && review.pronunciation.status !== review.oralAnalysis.pronunciation.status) {
    context.addIssue({ code: "custom", message: "top-level pronunciation status must match oralAnalysis", path: ["pronunciation", "status"] });
  }
  if (hasVoiceEvidence && review.scores.fluency.status !== review.oralAnalysis.fluency.status) {
    context.addIssue({ code: "custom", message: "fluency score status must match oralAnalysis", path: ["scores", "fluency", "status"] });
  }
  if (review.scores.fluency.status === "assessed" && !["audio", "live_checkpoint"].includes(review.scores.fluency.basis)) {
    context.addIssue({ code: "custom", message: "assessed fluency requires Voice evidence basis", path: ["scores", "fluency"] });
  }
  if (review.oralAnalysis.evidenceMode === "live_checkpoint" && review.scores.fluency.status === "assessed" && review.scores.fluency.basis !== "live_checkpoint") {
    context.addIssue({ code: "custom", message: "checkpoint fluency requires live_checkpoint basis", path: ["scores", "fluency", "basis"] });
  }
  if (review.oralAnalysis.pronunciation.status === "assessed" && review.oralAnalysis.pronunciation.observations.length === 0) {
    context.addIssue({ code: "custom", message: "assessed pronunciation requires at least one direct observation", path: ["oralAnalysis", "pronunciation", "observations"] });
  }
  if (review.oralAnalysis.fluency.status === "assessed" && review.oralAnalysis.fluency.signals.length === 0) {
    context.addIssue({ code: "custom", message: "assessed fluency requires at least one direct signal", path: ["oralAnalysis", "fluency", "signals"] });
  }
  if (review.scores.fluency.status === "unassessed" && review.oralAnalysis.fluency.band !== null) {
    context.addIssue({ code: "custom", message: "unassessed fluency requires a null oral band", path: ["oralAnalysis", "fluency", "band"] });
  }
  if (review.oralAnalysis.fluency.status === "assessed" && (review.oralAnalysis.fluency.band === null || review.scores.fluency.band !== review.oralAnalysis.fluency.band)) {
    context.addIssue({ code: "custom", message: "oral and score fluency bands must match", path: ["oralAnalysis", "fluency", "band"] });
  }

  if (review.keyIssues.length === 0) {
    if (focusIds.length !== 0 || review.nextPractice.retrySentenceEn !== null) {
      context.addIssue({ code: "custom", message: "reviews without keyIssues require no focusRuleIds and a null retrySentenceEn", path: ["nextPractice"] });
    }
  } else {
    const focusedIssue = review.keyIssues.find((issue) => issue.ruleId === focusIds[0]);
    if (!focusedIssue || review.nextPractice.retrySentenceEn !== focusedIssue.rewrite) {
      context.addIssue({ code: "custom", message: "retrySentenceEn must equal the rewrite for the first focused issue", path: ["nextPractice", "retrySentenceEn"] });
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
    review.oralAnalysis.summaryZh,
    review.oralAnalysis.pronunciation.summaryZh,
    review.oralAnalysis.fluency.summaryZh,
    ...liveCheckpoints.map((item) => item.observationZh),
    ...review.usefulExpressions.map((item) => item.whyItWorksZh),
    ...review.segments.map((item) => item.observationZh),
  ];
  const coachMarker = /\[EGLearn\s+(?:live checkpoint|oral recap)\]/i;
  const learnerEvidence = [
    ...review.strengths.flatMap((item) => item.evidence.map((itemEvidence) => itemEvidence.quote)),
    ...review.keyIssues.flatMap((item) => [item.original, item.rewrite]),
    ...review.usefulExpressions.map((item) => item.quote),
    ...review.segments.flatMap((item) => item.evidence.map((itemEvidence) => itemEvidence.quote)),
  ];
  if (learnerEvidence.some((quote) => coachMarker.test(quote))) {
    context.addIssue({ code: "custom", message: "coach checkpoint text cannot be used as learner evidence", path: ["keyIssues"] });
  }
  const unsupportedClaim = /(?:\b(?:A1|A2|B1|B2|C1|C2)\b|\d{1,3}\s*%|总分|连续\s*\d+\s*天|重复(?:出现)?\s*\d+\s*次|\b[0-5]\s*\/\s*5\b)/i;
  if (generatedCommentary.some((text) => unsupportedClaim.test(text))) {
    context.addIssue({ code: "custom", message: "generated commentary contains an unsupported level, percentage, streak, or recurrence claim", path: ["summaryZh"] });
  }
});

export const reviewInputSchema = z.union([reviewSchema, reviewSchemaV11]);

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

  const result = reviewInputSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };

  return {
    success: false,
    errors: result.error.issues.map((issue) => {
      const location = issue.path.length ? issue.path.join(".") : "review";
      return `${location}: ${issue.message}`;
    }),
  };
}
