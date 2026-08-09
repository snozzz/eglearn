"use client";

import { useState } from "react";
import { reviewPrompt, voiceStarterSpoken } from "@/lib/chat-live-prompts.mjs";

type CopyTarget = "starter" | "review";

export function ChatLiveLauncher() {
  const [notice, setNotice] = useState("");
  const [fallback, setFallback] = useState("");

  async function copy(text: string, target: CopyTarget) {
    try {
      await navigator.clipboard.writeText(text);
      setFallback("");
      setNotice(
        target === "starter"
          ? "开场口令已复制。先启动 Voice，再照着读，不要提前发送文字。"
          : "完整复盘口令已复制。把它粘贴到刚结束 Voice 的同一 Chat。",
      );
    } catch {
      setFallback(text);
      setNotice("浏览器没有授予剪贴板权限，请在下方文本框手动复制。");
    }
  }

  return (
    <section className="liveLauncher" id="live" aria-labelledby="live-title">
      <div className="launcherHeading">
        <div>
          <span className="sectionKicker">Chat + GPT-Live</span>
          <h2 id="live-title">先开 Voice，再开始练。</h2>
        </div>
        <p>
          必须从 ChatGPT 桌面端一个全新的空白 Chat 开始，并在发送任何文字前点击
          <strong> Start new voice chat</strong>。先发文字只会进入语音听写。
        </p>
      </div>

      <div className="launcherGrid">
        <article className="launcherCard">
          <span className="launcherNumber">01</span>
          <h3>对着 GPT-Live 读开场口令</h3>
          <p>启动 Voice 后照着读即可。它会先问你想练的真实场景，并让你多开口。</p>
          <blockquote>{voiceStarterSpoken}</blockquote>
          <button type="button" onClick={() => void copy(voiceStarterSpoken, "starter")}>复制开场口令</button>
          <small>复制是为了方便对照；不要在启动 Voice 之前把它发进 Chat。</small>
        </article>

        <article className="launcherCard accentCard">
          <span className="launcherNumber">02</span>
          <h3>结束 Voice 后复制完整复盘</h3>
          <p>回到同一 Chat，粘贴这份完整契约。普通 Chat 不认识 EGLearn 格式，所以不能只说“帮我复盘”。</p>
          <button className="launcherPrimary" type="button" onClick={() => void copy(reviewPrompt, "review")}>复制完整复盘口令</button>
          <details>
            <summary>查看复盘口令包含什么</summary>
            <p>会话边界、完整 v1.0 JSON 字段、受控错误分类、样本阈值，以及不评估发音和流利度的诚实边界。</p>
          </details>
        </article>
      </div>

      {notice && <p className="launcherNotice" role="status">{notice}</p>}
      {fallback && (
        <label className="launcherFallback">
          手动复制
          <textarea readOnly value={fallback} onFocus={(event) => event.currentTarget.select()} />
        </label>
      )}
    </section>
  );
}

