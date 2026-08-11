export const validReviewV11 = {
  schemaVersion: "1.1",
  topicEn: "Explaining a project decision",
  sample: {
    status: "sufficient",
    learnerWordCount: 420,
    substantiveTurnCount: 12,
    reasonZh: "样本包含多轮说明、追问和回应，足以做深度复盘。",
  },
  summaryZh: "能够持续解释项目取舍并回应追问。下一步重点是过去时、技术搭配和被直接听到的一个发音观察。",
  strengths: [
    {
      dimension: "communication",
      noteZh: "能先交代背景，再说明决定和下一步，信息组织清楚。",
      evidence: [{ quote: "The main trade-off is speed versus reliability." }],
    },
    {
      dimension: "interaction",
      noteZh: "会主动澄清对方的问题，并继续展开自己的理由。",
      evidence: [{ quote: "Do you mean the technical risk or the timeline?" }],
    },
  ],
  keyIssues: [
    {
      ruleId: "G_PAST_TENSE",
      impact: "meaning_affecting",
      original: "Yesterday we finish the test.",
      rewrite: "Yesterday we finished the test.",
      explanationZh: "明确的过去时间后，叙述动词需要使用过去式。",
      practiceCueEn: "Use the past form after yesterday or last week.",
    },
    {
      ruleId: "L_COLLOCATION",
      impact: "polish",
      original: "make a security decision",
      rewrite: "make a security-related decision",
      explanationZh: "security-related decision 更清楚地表达这是和安全有关的决定。",
      practiceCueEn: "Use security-related before a noun when you mean the topic area.",
    },
  ],
  scores: {
    grammar: { status: "assessed", band: 3, basis: "transcript", rationaleZh: "意思清楚，但叙述时态仍有一处需要稳定。" },
    vocabulary: { status: "assessed", band: 4, basis: "transcript", rationaleZh: "主题词汇够用，少数搭配可以更精确。" },
    communication: { status: "assessed", band: 4, basis: "transcript", rationaleZh: "能够解释取舍、澄清问题并推进对话。" },
    fluency: { status: "assessed", band: 3, basis: "audio", rationaleZh: "直接听到少量开头犹豫，但整体能够持续展开。" },
  },
  pronunciation: { status: "assessed", reasonZh: "Voice 中直接听到一处可以马上重说核对的发音观察。" },
  usefulExpressions: [
    { quote: "The main trade-off is speed versus reliability.", whyItWorksZh: "可以清楚引出两个方案之间的关键取舍。", reusablePatternEn: "The main trade-off is A versus B." },
    { quote: "Do you mean the technical risk or the timeline?", whyItWorksZh: "这是自然的澄清问题，可以避免答非所问。", reusablePatternEn: "Do you mean A or B?" },
  ],
  segments: [
    {
      titleEn: "Project decision",
      learnerGoalZh: "说明为什么在速度和可靠性之间选择折中方案。",
      evidence: [{ quote: "The main trade-off is speed versus reliability." }],
      observationZh: "核心观点清楚，可以补充一个具体例子支持取舍。",
      improvedResponseEn: "We chose the slower option because reliability mattered more for this release.",
      drillPromptEn: "Explain one trade-off and give one concrete consequence.",
    },
    {
      titleEn: "Clarifying a question",
      learnerGoalZh: "确认对方是在问技术风险还是时间安排。",
      evidence: [{ quote: "Do you mean the technical risk or the timeline?" }],
      observationZh: "澄清策略自然，下一步可以继续回答对方确认的分支。",
      improvedResponseEn: "If you mean the technical risk, the main concern is data loss.",
      drillPromptEn: "Ask a clarification question, then answer both possible meanings.",
    },
  ],
  oralAnalysis: {
    evidenceMode: "audio",
    confidence: "medium",
    summaryZh: "整体表达可以持续；Voice 中直接听到一个技术词需要重说，并观察到几次开头犹豫。",
    pronunciation: {
      status: "assessed",
      summaryZh: "只记录直接听到且能让学习者马上重说核对的观察。",
      observations: [
        { wordEn: "reliability", targetEn: "reliability", issueZh: "重音需要更集中在中间音节。", cueEn: "Say: re-li-a-BIL-i-ty.", confidence: "medium" },
      ],
    },
    fluency: {
      status: "assessed",
      band: 3,
      summaryZh: "长回答开头有短暂犹豫，但自我修正没有阻断主要信息。",
      signals: [
        { dimension: "pausing", observationZh: "开始解释复杂取舍时出现几次短暂犹豫。" },
        { dimension: "self_correction", observationZh: "有一次自我修正，之后继续完成了观点。" },
      ],
    },
    liveCorrections: [
      { targetEn: "reliability", cueEn: "Repeat: reliability.", outcome: "improved_after_repeat" },
    ],
  },
  nextPractice: {
    focusRuleIds: ["G_PAST_TENSE", "L_COLLOCATION"],
    scenarioEn: "Give a short project update to a teammate.",
    promptsEn: ["Explain what happened yesterday.", "Name the trade-off.", "Propose the next action."],
    retrySentenceEn: "Yesterday we finished the test.",
  },
};
