"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { buildProgress } from "@/lib/progress.mjs";
import {
  buildObsidianNewUri,
  renderSessionMarkdown,
  sessionMarkdownFilename,
} from "@/lib/obsidian-export.mjs";
import { parseReviewText } from "@/lib/review-contract.mjs";
import { clearSessions, listSessions, saveSession } from "@/lib/session-store.mjs";

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
  const [vaultName, setVaultName] = useState("");
  const [targetFolder, setTargetFolder] = useState("EGLearn/Speaking Sessions");
  const [exportNotice, setExportNotice] = useState("");
  const [manualMarkdown, setManualMarkdown] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

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

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setVaultName(window.localStorage.getItem("eglearn.obsidian.vault") ?? "");
      setTargetFolder(window.localStorage.getItem("eglearn.obsidian.folder") ?? "EGLearn/Speaking Sessions");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function updateVault(value: string) {
    setVaultName(value);
    window.localStorage.setItem("eglearn.obsidian.vault", value);
  }

  function updateFolder(value: string) {
    setTargetFolder(value);
    window.localStorage.setItem("eglearn.obsidian.folder", value);
  }

  async function markdownFor(session: StoredSession) {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const markdown = await renderSessionMarkdown(session, { timeZone });
    return { markdown, filename: sessionMarkdownFilename(session, timeZone) };
  }

  async function downloadMarkdown(session: StoredSession) {
    try {
      const { markdown, filename } = await markdownFor(session);
      const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      setExportNotice(`已准备下载 ${filename}`);
      setManualMarkdown("");
    } catch (error) {
      setExportNotice(error instanceof Error ? error.message : "Markdown 生成失败。" );
    }
  }

  async function copyMarkdown(session: StoredSession) {
    try {
      const { markdown } = await markdownFor(session);
      try {
        await navigator.clipboard.writeText(markdown);
        setExportNotice("Markdown 已复制。可以直接在 Obsidian 新建笔记并粘贴。");
        setManualMarkdown("");
      } catch {
        setManualMarkdown(markdown);
        setExportNotice("浏览器拒绝剪贴板权限。请在下方文本框手动复制。");
      }
    } catch (error) {
      setExportNotice(error instanceof Error ? error.message : "Markdown 生成失败。");
    }
  }

  async function openInObsidian(session: StoredSession) {
    try {
      const { markdown, filename } = await markdownFor(session);
      await navigator.clipboard.writeText(markdown);
      const uri = buildObsidianNewUri({ vault: vaultName, folder: targetFolder, filename });
      setExportNotice("已复制 Markdown，并请求 Obsidian 创建笔记；请在 Obsidian 中确认结果。");
      setManualMarkdown("");
      window.location.assign(uri);
    } catch (error) {
      setExportNotice(error instanceof Error ? error.message : "无法请求 Obsidian 创建笔记。" );
    }
  }

  async function handleClearSessions() {
    if (!confirmClear) {
      setConfirmClear(true);
      setExportNotice("此操作会永久删除当前浏览器里的全部练习记录。请再次点击确认。");
      return;
    }
    try {
      await clearSessions();
      setSessions([]);
      setConfirmClear(false);
      setExportNotice("当前浏览器里的练习记录已全部删除，无法恢复。");
    } catch (error) {
      setExportNotice(error instanceof Error ? error.message : "无法清空本地记录。" );
    }
  }

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
                  <div className="exportActions" aria-label={`${session.review.topicEn} 导出操作`}>
                    <button type="button" onClick={() => downloadMarkdown(session)}>下载 Markdown</button>
                    <button type="button" onClick={() => copyMarkdown(session)}>复制 Markdown</button>
                    <button type="button" onClick={() => openInObsidian(session)} disabled={!vaultName.trim()}>在 Obsidian 中创建</button>
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>

      <ProgressSection sessions={sessions} />

      <div className="obsidianSection">
        <div className="historyHeading">
          <div><span className="panelLabel"><span>05</span> 可选出口</span><h3>Obsidian 设置</h3></div>
          <span>下载 / 复制始终可用</span>
        </div>
        <div className="obsidianGrid">
          <label>Vault 名称或 ID<input value={vaultName} onChange={(event) => updateVault(event.target.value)} placeholder="My English Vault" /></label>
          <label>目标目录<input value={targetFolder} onChange={(event) => updateFolder(event.target.value)} placeholder="EGLearn/Speaking Sessions" /></label>
          <div className="obsidianNote">
            <strong>URI 只是快捷入口</strong>
            <p>请先在 Vault 中创建目标目录。点击后我们只能确认已发出请求，不能读取 Vault 或验证同步结果；不会追加或覆盖现有笔记。</p>
          </div>
        </div>
        {exportNotice && <p className="exportNotice" role="status">{exportNotice}</p>}
        {manualMarkdown && (
          <label className="manualCopy">手动复制 Markdown<textarea readOnly value={manualMarkdown} onFocus={(event) => event.currentTarget.select()} /></label>
        )}
        <div className="dataControl">
          <div><strong>本机数据控制</strong><p>删除只影响当前浏览器，不会删除已经下载或写入 Obsidian 的 Markdown。</p></div>
          <button className={confirmClear ? "confirming" : ""} type="button" onClick={handleClearSessions} disabled={sessions.length === 0}>
            {confirmClear ? "再次点击，永久删除" : "清空本机记录"}
          </button>
        </div>
      </div>
    </section>
  );
}
