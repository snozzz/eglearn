"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { buildProgress } from "@/lib/progress.mjs";
import { parseReviewText } from "@/lib/review-contract.mjs";
import { listSessions, saveSession } from "@/lib/session-store.mjs";

type ReviewScore = {
  status: "assessed" | "unassessed";
  band: number | null;
  rationaleZh: string;
};

type ReviewData = {
  schemaVersion: "1.0";
  topicEn: string;
  sample: { status: "sufficient" | "insufficient"; learnerWordCount: number; substantiveTurnCount: number; reasonZh: string };
  summaryZh: string;
  strengths: Array<{ dimension: string; noteZh: string; evidence: Array<{ quote: string }> }>;
  keyIssues: Array<{ ruleId: string; impact: string; original: string; rewrite: string; explanationZh: string; practiceCueEn: string }>;
  scores: { grammar: ReviewScore; vocabulary: ReviewScore; communication: ReviewScore; fluency: ReviewScore };
  pronunciation: { status: "not_assessed"; reasonZh: string };
  usefulExpressions: Array<{ quote: string; whyItWorksZh: string; reusablePatternEn: string }>;
  nextPractice: { focusRuleIds: string[]; scenarioEn: string; promptsEn: string[]; retrySentenceEn: string | null };
};

type StoredSession = { id: string; importedAt: string; review: ReviewData };

type ProgressData = {
  totalSessions: number;
  totalLearnerWords: number;
  repeatedIssueCount: number;
  issueStats: Array<{ ruleId: string; labelZh: string; sessionCount: number; status: "new" | "repeated" | "frequent" }>;
  scoreTrends: Record<string, { points: Array<{ sessionId: string; band: number }>; latestDelta: number | null }>;
  comparisons: Array<{
    ruleId: string;
    labelZh: string;
    previous: { topicEn: string; original: string; rewrite: string };
    latest: { topicEn: string; original: string; rewrite: string };
  }>;
};

const scoreLabels = {
  grammar: "语法",
  vocabulary: "词汇",
  communication: "沟通",
  fluency: "流利度",
} as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function ScoreStrip({ review }: { review: ReviewData }) {
  return (
    <div className="scoreStrip" aria-label="练习分档">
      {Object.entries(scoreLabels).map(([key, label]) => {
        const score = review.scores[key as keyof typeof scoreLabels];
        return (
          <div className="scoreCell" key={key}>
            <span>{label}</span>
            <strong>{score.band ?? "—"}</strong>
            <small>{score.status === "assessed" ? "/ 5" : "未评估"}</small>
          </div>
        );
      })}
    </div>
  );
}

function ProgressSection({ sessions }: { sessions: StoredSession[] }) {
  const progress = useMemo(() => buildProgress(sessions) as ProgressData, [sessions]);
  const statusLabels = { new: "新问题", repeated: "反复", frequent: "高频" };

  return (
    <div className="progressSection">
      <div className="historyHeading">
        <div><span className="panelLabel"><span>04</span> 进步线索</span><h3>从记录里看趋势</h3></div>
        <span>没有练习机会，不判断“已掌握”</span>
      </div>

      <div className="progressStats">
        <div><span>练习</span><strong>{progress.totalSessions}</strong><small>sessions</small></div>
        <div><span>开口样本</span><strong>{progress.totalLearnerWords}</strong><small>words</small></div>
        <div><span>反复问题</span><strong>{progress.repeatedIssueCount}</strong><small>rule IDs</small></div>
      </div>

      {progress.totalSessions === 0 ? (
        <p className="historyEmpty">保存两次以上练习后，这里会显示分档记录和反复问题。</p>
      ) : (
        <div className="progressGrid">
          <div className="trendPanel">
            <h4>练习分档记录</h4>
            {(["grammar", "vocabulary", "communication"] as const).map((dimension) => {
              const trend = progress.scoreTrends[dimension];
              const delta = trend.latestDelta;
              return (
                <div className="trendRow" key={dimension}>
                  <div>
                    <span>{scoreLabels[dimension]}</span>
                    <small>{delta === null ? "等待第二次记录" : delta === 0 ? "较上次持平" : `较上次 ${delta > 0 ? "+" : ""}${delta} 档`}</small>
                  </div>
                  <div className="miniBars" aria-label={`${scoreLabels[dimension]}最近分档`}>
                    {trend.points.slice(-8).map((point) => (
                      <i key={point.sessionId} style={{ height: `${point.band * 15}%` }} title={`${point.band} / 5`} />
                    ))}
                  </div>
                  <strong>{trend.points.at(-1)?.band ?? "—"}<small>/5</small></strong>
                </div>
              );
            })}
            <p className="trendDisclaimer">分档只描述当次文字样本，不是英语等级，也不代表线性进步。</p>
          </div>

          <div className="issuePanel">
            <h4>受控错误分类</h4>
            {progress.issueStats.length === 0 ? <p>还没有可跨会话聚合的重点问题。</p> : (
              <ol>
                {progress.issueStats.slice(0, 6).map((issue) => (
                  <li key={issue.ruleId}>
                    <div><strong>{issue.labelZh}</strong><code>{issue.ruleId}</code></div>
                    <span className={`recurrence ${issue.status}`}>{statusLabels[issue.status]} · {issue.sessionCount} 次</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}

      {progress.comparisons.length > 0 && (
        <div className="comparisonPanel">
          <div><h4>最近两次复现对比</h4><p>只比较同类问题再次出现时的原句；没有出现不等于已经掌握。</p></div>
          <div className="comparisonGrid">
            {progress.comparisons.slice(0, 3).map((comparison) => (
              <article key={comparison.ruleId}>
                <span>{comparison.labelZh}</span>
                <div><small>上一次 · {comparison.previous.topicEn}</small><del>{comparison.previous.original}</del><strong>{comparison.previous.rewrite}</strong></div>
                <div><small>最近一次 · {comparison.latest.topicEn}</small><del>{comparison.latest.original}</del><strong>{comparison.latest.rewrite}</strong></div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ReviewDashboard() {
  const [rawReview, setRawReview] = useState("");
  const [pendingReview, setPendingReview] = useState<ReviewData | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    listSessions()
      .then((records: StoredSession[]) => {
        if (active) setSessions(records);
      })
      .catch((error: Error) => {
        if (active) setErrors([error.message]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  function validate(event: FormEvent) {
    event.preventDefault();
    setNotice("");
    if (!rawReview.trim()) {
      setPendingReview(null);
      setErrors(["请先粘贴 Custom GPT 生成的 JSON 代码块。"]);
      return;
    }

    const result = parseReviewText(rawReview);
    if (!result.success) {
      setPendingReview(null);
      setErrors(result.errors);
      return;
    }

    setErrors([]);
    setPendingReview(result.data as ReviewData);
  }

  async function confirmSave() {
    if (!pendingReview) return;
    setSaving(true);
    setErrors([]);
    try {
      const record = await saveSession(pendingReview) as StoredSession;
      setSessions((current) => [record, ...current]);
      setPendingReview(null);
      setRawReview("");
      setNotice("已保存到当前浏览器。没有上传到服务器。");
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "保存失败，请重试。"]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="dashboard" id="dashboard" aria-labelledby="dashboard-title">
      <div className="dashboardHeading">
        <div>
          <span className="sectionKicker">Local-first dashboard</span>
          <h2 id="dashboard-title">把这次练习留下来</h2>
        </div>
        <p>复盘只存当前浏览器的 IndexedDB。无需登录，不会发送到我们的服务器。</p>
      </div>

      <div className="dashboardGrid">
        <form className="importPanel" onSubmit={validate}>
          <div className="panelLabel"><span>01</span> 粘贴 GPT 复盘</div>
          <label htmlFor="review-json">JSON 代码块</label>
          <textarea
            id="review-json"
            value={rawReview}
            onChange={(event) => setRawReview(event.target.value)}
            placeholder={'```json\n{\n  "schemaVersion": "1.0",\n  ...\n}\n```'}
            spellCheck={false}
          />
          <p className="inputHint">只接受 v1.0 契约。代码块外有多余文字、评分越界或未知字段都会被拒绝。</p>
          <button className="primaryButton formButton" type="submit">检查复盘</button>

          {errors.length > 0 && (
            <div className="errorBox" role="alert">
              <strong>暂时不能导入</strong>
              <ul>{errors.slice(0, 6).map((error) => <li key={error}>{error}</li>)}</ul>
            </div>
          )}
          {notice && <p className="successNotice" role="status">{notice}</p>}
        </form>

        <div className="previewPanel">
          <div className="panelLabel"><span>02</span> 核对并确认</div>
          {!pendingReview ? (
            <div className="previewEmpty">
              <span aria-hidden="true">↙</span>
              <h3>校验通过后在这里预览</h3>
              <p>我们能检查 JSON 结构，但不能独立证明引用来自语音转录。保存前请快速核对原句。</p>
            </div>
          ) : (
            <div className="reviewPreview">
              <span className="validBadge">结构校验通过</span>
              <h3>{pendingReview.topicEn}</h3>
              <p>{pendingReview.summaryZh}</p>
              <ScoreStrip review={pendingReview} />
              {pendingReview.keyIssues.length > 0 && (
                <div className="previewIssue">
                  <span>优先修正</span>
                  <del>{pendingReview.keyIssues[0].original}</del>
                  <strong>{pendingReview.keyIssues[0].rewrite}</strong>
                </div>
              )}
              <button className="primaryButton formButton" type="button" onClick={confirmSave} disabled={saving}>
                {saving ? "正在保存…" : "确认保存到本机"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="historySection">
        <div className="historyHeading">
          <div><span className="panelLabel"><span>03</span> 历史记录</span><h3>最近练习</h3></div>
          <span>{sessions.length} 次已保存</span>
        </div>

        {loading ? (
          <p className="historyEmpty">正在读取本地记录…</p>
        ) : sessions.length === 0 ? (
          <p className="historyEmpty">还没有记录。完成一次 ChatGPT 语音练习后，把复盘粘贴到上方。</p>
        ) : (
          <div className="sessionList">
            {sessions.map((session) => (
              <details className="sessionCard" key={session.id}>
                <summary>
                  <div>
                    <span>{formatDate(session.importedAt)} · {session.review.sample.learnerWordCount} words</span>
                    <h4>{session.review.topicEn}</h4>
                    <p>{session.review.summaryZh}</p>
                  </div>
                  <span className="issueCount">{session.review.keyIssues.length} 个重点</span>
                </summary>
                <div className="sessionDetail">
                  <ScoreStrip review={session.review} />
                  <div className="detailColumns">
                    <div>
                      <h5>这次做得好</h5>
                      {session.review.strengths.length === 0 ? <p>样本不足，未生成优点。</p> : session.review.strengths.map((item) => (
                        <blockquote key={item.noteZh}><p>{item.noteZh}</p><cite>“{item.evidence[0].quote}”</cite></blockquote>
                      ))}
                    </div>
                    <div>
                      <h5>下次练什么</h5>
                      <p>{session.review.nextPractice.scenarioEn}</p>
                      {session.review.nextPractice.retrySentenceEn && <code>{session.review.nextPractice.retrySentenceEn}</code>}
                    </div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>

      <ProgressSection sessions={sessions} />
    </section>
  );
}
