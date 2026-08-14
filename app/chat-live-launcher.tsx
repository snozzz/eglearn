"use client";

import { useState } from "react";
import {
  checkpointTemplateSpoken,
  checkpointTriggerSpoken,
  projectInstructions,
  reviewPrompt,
  voiceStarterShortSpoken,
  voiceStarterSpoken,
} from "@/lib/chat-live-prompts.mjs";

type CopyTarget = "project" | "starter" | "starterFull" | "review";

const notices: Record<CopyTarget, string> = {
  project: "教练协议已复制。粘贴到 ChatGPT Project 的说明里保存一次，之后每次 Voice 都会生效。",
  starter: "开场口令已复制。先启动 Voice，再照着读，不要提前发送文字。",
  starterFull: "完整开场口令已复制。没有配置 Project 时，启动 Voice 后照着读这一段。",
  review: "深度复盘口令已复制。把它粘贴到刚结束 Voice 的同一 Chat。",
};

export function ChatLiveLauncher() {
  const [notice, setNotice] = useState("");
  const [fallback, setFallback] = useState("");

  async function copy(text: string, target: CopyTarget) {
    try {
      await navigator.clipboard.writeText(text);
      setFallback("");
      setNotice(notices[target]);
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

      <article className="launcherSetup">
        <span className="launcherNumber">00 · 一次性设置</span>
        <h3>把教练协议放进 ChatGPT Project</h3>
        <p>
          在 ChatGPT 里新建一个 Project（例如 <strong>EGLearn Speaking</strong>），把这段协议粘贴进它的
          <strong> Instructions</strong> 保存，之后在这个 Project 里开的每次 Voice 都自带纠音规则。
          常驻说明不会像开场口述那样在长会话里被忘掉，也不需要在启动 Voice 前发送任何文字。
        </p>
        <button type="button" onClick={() => void copy(projectInstructions, "project")}>复制教练协议</button>
        <small>如果你的客户端不支持在 Project 内直接启动 Voice，也可以粘贴到「自定义指令」，或退回下面的完整开场口令。</small>
        <details>
          <summary>查看协议全文</summary>
          <blockquote>{projectInstructions}</blockquote>
        </details>
      </article>

      <div className="launcherGrid">
        <article className="launcherCard">
          <span className="launcherNumber">01</span>
          <h3>对着 GPT-Live 读开场口令</h3>
          <p>
            启动 Voice 后照着读这一句即可，协议已经常驻在 Project 里。练习中任何时候说
            <code> {checkpointTriggerSpoken} </code>
            都会立刻触发一次纠音检查——这比等它自己想起来可靠得多。
          </p>
          <blockquote>{voiceStarterShortSpoken}</blockquote>
          <button type="button" onClick={() => void copy(voiceStarterShortSpoken, "starter")}>复制开场口令</button>
          <small>复制是为了方便对照；不要在启动 Voice 之前把它发进 Chat。</small>
          <details>
            <summary>没有配置 Project？读完整开场口令</summary>
            <p>把整段协议在 Voice 里读一遍也能用，但长会话里的自发检查频率会明显下降。</p>
            <button type="button" onClick={() => void copy(voiceStarterSpoken, "starterFull")}>复制完整开场口令</button>
          </details>
        </article>

        <article className="launcherCard accentCard">
          <span className="launcherNumber">02</span>
          <h3>结束 Voice 后复制完整复盘</h3>
          <p>回到同一 Chat，粘贴这份深度复盘口令。它会覆盖完整练习、分段问题、可复用表达，以及 Voice 中确实直接听到的口语观察。</p>
          <button className="launcherPrimary" type="button" onClick={() => void copy(reviewPrompt, "review")}>复制深度复盘口令</button>
          <details>
            <summary>查看复盘口令包含什么</summary>
            <p>会话边界、完整 v1.1 JSON 字段、分段深度分析、受控错误分类，以及只有在 Voice 直接音频可核对时才记录发音和流利度。</p>
            <p>固定 checkpoint 模板：<code>{checkpointTemplateSpoken}</code></p>
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
