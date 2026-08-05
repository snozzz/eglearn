export const ruleLabelsZh = {
  G_PAST_TENSE: "一般过去时",
  G_PRESENT_PERFECT: "现在完成时",
  G_TENSE_ASPECT_OTHER: "时态与体",
  G_SUBJECT_VERB_AGREEMENT: "主谓一致",
  G_ARTICLE_MISSING: "缺少冠词",
  G_ARTICLE_CHOICE: "冠词选择",
  G_COUNTABILITY: "可数与不可数",
  G_PREPOSITION_TIME_PLACE: "时间/地点介词",
  G_PREPOSITION_COLLOCATION: "介词搭配",
  G_WORD_ORDER: "语序",
  G_PRONOUN_REFERENCE: "代词指代",
  G_INFINITIVE_GERUND: "不定式与动名词",
  G_MODAL: "情态动词",
  G_CONDITIONAL: "条件句",
  L_WORD_CHOICE: "词语选择",
  L_COLLOCATION: "词汇搭配",
  L_WORD_FORM: "词形",
  L_REGISTER: "语域与得体性",
  L_EXCESSIVE_REPETITION: "词语重复",
  D_COHESION: "衔接",
  D_RELEVANCE: "回应相关性",
  D_CLARIFICATION: "澄清策略",
  D_TURN_DEVELOPMENT: "展开表达",
  OTHER: "其他",
};

const scoreDimensions = ["grammar", "vocabulary", "communication"];

function recurrenceStatus(sessionCount) {
  if (sessionCount >= 4) return "frequent";
  if (sessionCount >= 2) return "repeated";
  return "new";
}

export function buildProgress(inputSessions) {
  const sessions = [...new Map(inputSessions.map((session) => [session.id, session])).values()]
    .sort((left, right) => left.importedAt.localeCompare(right.importedAt));
  const issueMap = new Map();

  for (const session of sessions) {
    const seenThisSession = new Set();
    for (const issue of session.review.keyIssues) {
      if (issue.ruleId === "OTHER" || seenThisSession.has(issue.ruleId)) continue;
      seenThisSession.add(issue.ruleId);
      const current = issueMap.get(issue.ruleId) ?? {
        ruleId: issue.ruleId,
        labelZh: ruleLabelsZh[issue.ruleId] ?? issue.ruleId,
        sessionCount: 0,
        firstSeenAt: session.importedAt,
        lastSeenAt: session.importedAt,
        appearances: [],
      };
      current.sessionCount += 1;
      current.lastSeenAt = session.importedAt;
      current.appearances.push({
        sessionId: session.id,
        importedAt: session.importedAt,
        topicEn: session.review.topicEn,
        original: issue.original,
        rewrite: issue.rewrite,
      });
      issueMap.set(issue.ruleId, current);
    }
  }

  const issueStats = [...issueMap.values()]
    .map((stat) => ({ ...stat, status: recurrenceStatus(stat.sessionCount) }))
    .sort((left, right) => right.sessionCount - left.sessionCount || right.lastSeenAt.localeCompare(left.lastSeenAt));

  const scoreTrends = Object.fromEntries(scoreDimensions.map((dimension) => {
    const points = sessions.flatMap((session) => {
      const score = session.review.scores[dimension];
      return score.status === "assessed"
        ? [{ sessionId: session.id, importedAt: session.importedAt, topicEn: session.review.topicEn, band: score.band }]
        : [];
    });
    const latestDelta = points.length >= 2 ? points.at(-1).band - points.at(-2).band : null;
    return [dimension, { points, latestDelta }];
  }));

  const comparisons = issueStats
    .filter((stat) => stat.appearances.length >= 2)
    .map((stat) => ({
      ruleId: stat.ruleId,
      labelZh: stat.labelZh,
      status: stat.status,
      previous: stat.appearances.at(-2),
      latest: stat.appearances.at(-1),
    }));

  return {
    totalSessions: sessions.length,
    totalLearnerWords: sessions.reduce((sum, session) => sum + session.review.sample.learnerWordCount, 0),
    issueStats,
    repeatedIssueCount: issueStats.filter((stat) => stat.sessionCount >= 2).length,
    scoreTrends,
    comparisons,
  };
}
