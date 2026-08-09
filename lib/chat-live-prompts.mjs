import {
  errorRuleIds,
  fluencyUnassessedReasonZh,
  pronunciationUnassessedReasonZh,
} from "./review-contract.mjs";

export const voiceSessionMarker = "EGLearn session starts now";

export const voiceStarterSpoken = `${voiceSessionMarker}. Please be my English speaking coach for about ten minutes. Keep each reply short, ask one question at a time, let me speak most of the time, and correct only errors that block meaning. Remember my English for a review after I end Voice. First ask which real-life situation I want to practise.`;

const exampleReview = {
  schemaVersion: "1.0",
  topicEn: "Ordering coffee",
  sample: {
    status: "sufficient",
    learnerWordCount: 73,
    substantiveTurnCount: 6,
    reasonZh: "样本足以做基础语法、词汇和沟通反馈。",
  },
  summaryZh: "学习者能够完成点单，但单数可数名词前的冠词仍不稳定。",
  strengths: [
    {
      dimension: "communication",
      noteZh: "能够礼貌、清楚地提出请求。",
      evidence: [{ quote: "Could I get a latte, please?" }],
    },
  ],
  keyIssues: [
    {
      ruleId: "G_ARTICLE_MISSING",
      impact: "polish",
      original: "I would like large coffee.",
      rewrite: "I would like a large coffee.",
      explanationZh: "单数可数名词前需要限定词。",
      practiceCueEn: "Use a/an before a singular drink size and item.",
    },
  ],
  scores: {
    grammar: {
      status: "assessed",
      band: 3,
      basis: "transcript",
      rationaleZh: "简单句大体稳定，但冠词仍不稳定。",
    },
    vocabulary: {
      status: "assessed",
      band: 3,
      basis: "transcript",
      rationaleZh: "熟悉场景的词汇足以完成交流。",
    },
    communication: {
      status: "assessed",
      band: 4,
      basis: "transcript",
      rationaleZh: "能清楚提出要求并回应追问。",
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
      quote: "Could I get a latte, please?",
      whyItWorksZh: "礼貌且自然地提出点单请求。",
      reusablePatternEn: "Could I get + item, please?",
    },
  ],
  nextPractice: {
    focusRuleIds: ["G_ARTICLE_MISSING"],
    scenarioEn: "Change a restaurant order after it has been placed.",
    promptsEn: ["Explain what you ordered.", "Ask for the corrected item politely."],
    retrySentenceEn: "I would like a large coffee.",
  },
};

export const reviewPrompt = `请复盘本聊天中最近一次 EGLearn 英语口语练习。不要调用 Action、插件、工具或 API，也不要声称已经保存。

分析边界：只分析我最近一次说出“${voiceSessionMarker}”之后、这条请求之前的学习者英文；更早的聊天和教练自己的英文都不计入。Voice 转写可能不准确，只做有原句证据的高置信度反馈。

输出要求：只返回一个 fenced json 代码块，代码块外不得有任何文字。严格输出 EGLearn v1.0 对象，不得增删字段。下面对象只示意结构；必须用本次真实主题、计数、原句和反馈替换示例内容。strengths、keyIssues、usefulExpressions 各 0–3 项。

${JSON.stringify(exampleReview, null, 2)}

受控规则：
- dimension 只能是 grammar、vocabulary、communication、interaction。
- impact 只能是 meaning_blocking、meaning_affecting、polish。
- ruleId 只能是：${errorRuleIds.join(", ")}。
- 同一 ruleId 最多一次；OTHER 仅在其他分类都不适用时使用。
- 每个 strength 必须引用我的英文原句；每个 issue 必须保留原句并给出最小必要改写。没有高置信度问题时，keyIssues 可以为空，不要凑数。
- learnerWordCount 少于 40 或 substantiveTurnCount 少于 3 时，sample.status 必须为 insufficient，grammar、vocabulary、communication 全部使用 status=unassessed、band=null、basis=none。
- 样本同时达到 40 词和 3 个实质回答时，sample.status 必须为 sufficient；grammar、vocabulary、communication 可按本次文字样本给 1–5 整数练习档位，basis=transcript。这不是 CEFR 或考试等级。
- fluency 永远保持 unassessed，理由必须逐字为“${fluencyUnassessedReasonZh}”
- pronunciation 永远保持 not_assessed，理由必须逐字为“${pronunciationUnassessedReasonZh}”
- focusRuleIds 只能来自本次 keyIssues，最多 2 个且不重复。没有 issue 时必须为 [] 且 retrySentenceEn=null；否则 retrySentenceEn 必须逐字等于第一个 focus rule 对应 issue 的 rewrite。
- 不输出总分、百分比、CEFR、连续天数、跨会话重复次数、session ID、时间戳或保存结果。`;

