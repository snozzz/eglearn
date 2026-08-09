"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteCloudSessions,
  fetchCloudSessions,
  saveCloudReview,
} from "@/lib/cloud-client.mjs";
import { buildProgress } from "@/lib/progress.mjs";
import {
  buildObsidianNewUri,
  renderSessionMarkdown,
  sessionMarkdownFilename,
} from "@/lib/obsidian-export.mjs";
import { parseReviewText } from "@/lib/review-contract.mjs";
import {
  clearSessions,
  listSessions,
  putSessionRecord,
  replaceSessions,
  saveSession,
} from "@/lib/session-store.mjs";
import { mergeSessions } from "@/lib/session-sync.mjs";

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
  const [cloudState, setCloudState] = useState<"checking" | "synced" | "local" | "error">("checking");
  const [cloudNotice, setCloudNotice] = useState("正在连接私人云端记录…");
  const [syncing, setSyncing] = useState(false);

  const refreshFromCloud = useCallback(async (quiet = false) => {
    if (!quiet) {
      setCloudState("checking");
      setCloudNotice("正在同步私人云端记录…");
    }

    try {
      const cloudSessions = await fetchCloudSessions() as StoredSession[];
      for (const record of cloudSessions) await putSessionRecord(record);
      setSessions((current) => mergeSessions(current, cloudSessions) as StoredSession[]);
      setCloudState("synced");
      setCloudNotice("私人云端已同步；本机保留离线缓存。");
      return cloudSessions;
    } catch (error) {
      setCloudState("local");
      if (!quiet) {
        setCloudNotice(
          error instanceof Error
            ? `${error.message} 当前仍可使用本机记录。`
            : "云同步暂不可用，当前仍可使用本机记录。",
        );
      }
      return null;
    }
  }, []);

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
        if (active) {
          setLoading(false);
          void refreshFromCloud();
        }
      });
    return () => { active = false; };
  }, [refreshFromCloud]);

  useEffect(() => {
    function refreshWhenVisible() {
      if (document.visibilityState === "visible") void refreshFromCloud(true);
    }
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshWhenVisible);
    return () => {
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, [refreshFromCloud]);

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
      setExportNotice("此操作会永久删除私人云端记录和当前浏览器缓存。请再次点击确认。");
      return;
    }
    const failures: string[] = [];
    try {
      await deleteCloudSessions();
    } catch {
      failures.push("云端记录未删除");
    }
    try {
      await clearSessions();
      setSessions([]);
      setConfirmClear(false);
    } catch {
      failures.push("本机缓存未删除");
    }
    setExportNotice(
      failures.length === 0
        ? "云端记录和本机缓存已全部删除，无法恢复。"
        : `删除未完全成功：${failures.join("；")}。请稍后重试。`,
    );
  }

  async function syncAllSessions() {
    if (sessions.length === 0 || syncing) return;
    setSyncing(true);
    setCloudNotice("正在把现有本机记录同步到私人云端…");
    try {
      const synced: StoredSession[] = [];
      for (const session of sessions) {
        const result = await saveCloudReview(session.review);
        synced.push(result.session as StoredSession);
        await putSessionRecord(result.session);
      }
      const merged = mergeSessions(sessions, synced) as StoredSession[];
      await replaceSessions(merged);
      setSessions(merged);
      setCloudState("synced");
      setCloudNotice("现有记录已同步；重复内容不会重复创建。");
    } catch (error) {
      setCloudState("error");
      setCloudNotice(error instanceof Error ? error.message : "现有记录暂时无法同步。");
    } finally {
      setSyncing(false);
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
      let record: StoredSession;
      try {
        const result = await saveCloudReview(pendingReview);
        record = result.session as StoredSession;
        await putSessionRecord(record);
        setCloudState("synced");
        setCloudNotice("私人云端已同步；本机保留离线缓存。");
        setNotice(result.status === "saved" ? "已保存并同步。" : "这份复盘已经保存过，没有重复创建。");
      } catch {
        record = await saveSession(pendingReview) as StoredSession;
        setCloudState("local");
        setCloudNotice("云同步暂不可用；这次复盘只保存在当前浏览器。");
        setNotice("已保存到当前浏览器；稍后可再次同步到云端。");
      }
      setSessions((current) => mergeSessions([record], current) as StoredSession[]);
      setPendingReview(null);
      setRawReview("");
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
          <span className="sectionKicker">Private sync dashboard</span>
          <h2 id="dashboard-title">把这次练习留下来</h2>
        </div>
        <div className="syncSummary">
          <p>Action 自动保存到你的私人记录；当前浏览器同时保留一份离线缓存。</p>
          <div className={`syncBadge ${cloudState}`} role="status">
            <i aria-hidden="true" />
            <span>{cloudNotice}</span>
            <button type="button" onClick={() => void refreshFromCloud()} disabled={cloudState === "checking"}>
              刷新
            </button>
          </div>
        </div>
      </div>

      <div className="dashboardGrid">
        <form className="importPanel" onSubmit={validate}>
          <div className="panelLabel"><span>01</span> 手工备用导入</div>
          <label htmlFor="review-json">JSON 代码块</label>
          <textarea
            id="review-json"
            value={rawReview}
            onChange={(event) => setRawReview(event.target.value)}
            placeholder={'```json\n{\n  "schemaVersion": "1.0",\n  ...\n}\n```'}
            spellCheck={false}
          />
          <p className="inputHint">正常情况下用“复盘并保存”自动同步。Action 失败时，仍可在这里粘贴 v1.0 JSON。</p>
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
                {saving ? "正在保存…" : "确认保存并同步"}
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
          <p className="historyEmpty">还没有记录。完成语音练习、退出 Voice 后发送“复盘并保存”。</p>
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
          <div><strong>记录与缓存</strong><p>同步会上传结构化复盘，不上传原始音频；删除仍不会影响已经导出的 Markdown。</p></div>
          <div className="dataButtons">
            <button type="button" onClick={syncAllSessions} disabled={sessions.length === 0 || syncing}>
              {syncing ? "正在同步…" : "同步现有记录"}
            </button>
            <button className={confirmClear ? "confirming" : ""} type="button" onClick={handleClearSessions} disabled={sessions.length === 0}>
              {confirmClear ? "再次点击，永久删除" : "删除全部记录"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
