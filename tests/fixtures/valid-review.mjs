import {
  fluencyUnassessedReasonZh,
  pronunciationUnassessedReasonZh,
} from "../../lib/review-contract.mjs";

export const validReview = {
  schemaVersion: "1.0",
  topicEn: "Giving a project update",
  sample: {
    status: "sufficient",
    learnerWordCount: 86,
    substantiveTurnCount: 7,
    reasonZh: "学习者完成了多轮项目进度说明，样本足以做基础反馈。",
  },
  summaryZh: "你能够说明进展、风险和下一步，核心信息清楚。",
  strengths: [
    {
      dimension: "communication",
      noteZh: "先说明完成项，再补充风险，信息顺序清楚。",
      evidence: [{ quote: "We finished the first test, but we still have one risk." }],
    },
  ],
  keyIssues: [
    {
      ruleId: "G_PAST_TENSE",
      impact: "meaning_affecting",
      original: "Yesterday we finish the first test.",
      rewrite: "Yesterday we finished the first test.",
      explanationZh: "明确的过去时间需要过去式。",
      practiceCueEn: "Use the past form after a finished-time marker such as yesterday.",
    },
  ],
  scores: {
    grammar: {
      status: "assessed",
      band: 3,
      basis: "transcript",
      rationaleZh: "简单句大体稳定，但过去时仍不稳定。",
    },
    vocabulary: {
      status: "assessed",
      band: 3,
      basis: "transcript",
      rationaleZh: "项目场景词汇足以传递核心信息。",
    },
    communication: {
      status: "assessed",
      band: 4,
      basis: "transcript",
      rationaleZh: "能够组织进度、风险和下一步。",
    },
    fluency: {
      status: "unassessed",
      band: null,
      basis: "none",
      rationaleZh: fluencyUnassessedReasonZh,
    },
  },
  pronunciation: {
    status: "not_assessed",
    reasonZh: pronunciationUnassessedReasonZh,
  },
  usefulExpressions: [
    {
      quote: "We still have one risk.",
      whyItWorksZh: "简洁地引出尚未解决的问题。",
      reusablePatternEn: "We still have + remaining issue.",
    },
  ],
  nextPractice: {
    focusRuleIds: ["G_PAST_TENSE"],
    scenarioEn: "Give a status update after a delayed software release.",
    promptsEn: ["Explain what happened yesterday.", "Describe the next action and owner."],
    retrySentenceEn: "Yesterday we finished the first test.",
  },
};
