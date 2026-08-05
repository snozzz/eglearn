# EGLearn review contract v1.0

Return exactly one JSON object with these fields. Do not add fields.

```json
{
  "schemaVersion": "1.0",
  "topicEn": "Ordering coffee",
  "sample": {
    "status": "sufficient",
    "learnerWordCount": 73,
    "substantiveTurnCount": 6,
    "reasonZh": "样本足以做基础语法、词汇和沟通反馈。"
  },
  "summaryZh": "一到两句具体总结。",
  "strengths": [
    {
      "dimension": "communication",
      "noteZh": "优点说明。",
      "evidence": [{ "quote": "Could I get a latte, please?" }]
    }
  ],
  "keyIssues": [
    {
      "ruleId": "G_ARTICLE_MISSING",
      "impact": "polish",
      "original": "I would like large coffee.",
      "rewrite": "I would like a large coffee.",
      "explanationZh": "单数可数名词前需要限定词。",
      "practiceCueEn": "Use a/an before a singular drink size and item."
    }
  ],
  "scores": {
    "grammar": {
      "status": "assessed",
      "band": 3,
      "basis": "transcript",
      "rationaleZh": "简单句大体稳定，但冠词仍不稳定。"
    },
    "vocabulary": {
      "status": "assessed",
      "band": 3,
      "basis": "transcript",
      "rationaleZh": "熟悉场景的词汇足以完成交流。"
    },
    "communication": {
      "status": "assessed",
      "band": 4,
      "basis": "transcript",
      "rationaleZh": "能清楚提出要求并回应追问。"
    },
    "fluency": {
      "status": "unassessed",
      "band": null,
      "basis": "none",
      "rationaleZh": "当前复盘没有可靠的语音时间证据，因此不评估流利度。"
    }
  },
  "pronunciation": {
    "status": "not_assessed",
    "reasonZh": "文字转录不足以可靠评估发音。"
  },
  "usefulExpressions": [
    {
      "quote": "Could I get a latte, please?",
      "whyItWorksZh": "礼貌且自然地提出点单请求。",
      "reusablePatternEn": "Could I get + item, please?"
    }
  ],
  "nextPractice": {
    "focusRuleIds": ["G_ARTICLE_MISSING"],
    "scenarioEn": "Change a restaurant order after it has been placed.",
    "promptsEn": ["Explain what you ordered.", "Ask for the corrected item politely."],
    "retrySentenceEn": "I would like a large coffee."
  }
}
```

## Controlled values

`dimension`: `grammar`, `vocabulary`, `communication`, `interaction`.

`impact`: `meaning_blocking`, `meaning_affecting`, `polish`.

`status` for grammar, vocabulary, and communication: `assessed` or `unassessed`. An assessed score uses integer band 1–5 and basis `transcript`. An unassessed score uses `band: null` and basis `none`.

`sample.learnerWordCount` and `sample.substantiveTurnCount` count only learner English within the current practice boundary. A sufficient sample requires both at least 40 words and at least 3 substantive turns.

Fluency must always be unassessed in v1.0, with the exact rationale `当前复盘没有可靠的语音时间证据，因此不评估流利度。`. Pronunciation must always be not assessed, with the exact reason `文字转录不足以可靠评估发音。`.

When `keyIssues` is empty, `focusRuleIds` must be empty and `retrySentenceEn` must be `null`. Otherwise the retry sentence must exactly match the rewrite of the first focused issue.

## Error rule IDs

- Tense: `G_PAST_TENSE`, `G_PRESENT_PERFECT`, `G_TENSE_ASPECT_OTHER`
- Agreement and nouns: `G_SUBJECT_VERB_AGREEMENT`, `G_ARTICLE_MISSING`, `G_ARTICLE_CHOICE`, `G_COUNTABILITY`
- Structure: `G_PREPOSITION_TIME_PLACE`, `G_PREPOSITION_COLLOCATION`, `G_WORD_ORDER`, `G_PRONOUN_REFERENCE`, `G_INFINITIVE_GERUND`, `G_MODAL`, `G_CONDITIONAL`
- Lexis: `L_WORD_CHOICE`, `L_COLLOCATION`, `L_WORD_FORM`, `L_REGISTER`, `L_EXCESSIVE_REPETITION`
- Discourse: `D_COHESION`, `D_RELEVANCE`, `D_CLARIFICATION`, `D_TURN_DEVELOPMENT`
- Fallback: `OTHER` only when no controlled category fits; do not use it for cross-session recurrence.

## Score bands

- 1: frequent problems make the learner hard to understand or complete the task.
- 2: partial control; the learner needs substantial listener support.
- 3: workable control for a familiar scenario, with noticeable limitations.
- 4: clear and flexible performance with minor limitations.
- 5: consistently effective control across varied structures or wording in this sample.

These are practice bands, not certification. Never convert them to percentages or CEFR levels.
