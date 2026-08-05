"use client";

import { FormEvent, useEffect, useState } from "react";
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
    </section>
  );
}
