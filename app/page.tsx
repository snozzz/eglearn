import type { Metadata } from "next";
import { ChatLiveLauncher } from "./chat-live-launcher";
import { ReviewDashboard } from "./review-dashboard";

export const metadata: Metadata = {
  title: "英语口语练习记录",
  description: "用 ChatGPT Plus 的 GPT-Live 练口语，再把结构化复盘保存到 EGLearn。",
};

export default function Home() {
  return (
    <main className="shell">
      <nav className="topbar" aria-label="主导航">
        <a className="brand" href="#top" aria-label="EGLearn 首页">
          <span className="brandMark" aria-hidden="true">e</span>
          <span>EGLearn</span>
        </a>
        <span className="buildBadge">Chat + GPT-Live · v1.3</span>
      </nav>

      <section className="hero" id="top">
        <div className="eyebrow">Speak · Notice · Improve</div>
        <h1>每次开口，<br />都留下进步的证据。</h1>
        <p className="heroCopy">
          在 ChatGPT Plus 的普通 Chat 里用 GPT-Live 练口语，退出 Voice 后生成一份
          可核对、可追踪的深度结构化复盘；Voice 中可以即时纠音，结束后再看完整分段反馈。无需 OpenAI API，也无需 Work 或插件。
        </p>
        <div className="heroActions">
          <a className="primaryButton" href="#live">开始一次练习</a>
          <a className="textButton" href="#principles">产品原则 <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section className="workflow" id="workflow" aria-labelledby="workflow-title">
        <div className="sectionHeading">
          <span>最短使用路径</span>
          <h2 id="workflow-title">三步完成一次闭环</h2>
        </div>
        <ol className="stepGrid">
          <li className="stepCard">
            <span className="stepNumber">01</span>
            <div className="stepIcon" aria-hidden="true">◉</div>
            <h3>在普通 Chat 里说</h3>
            <p>从空白 Chat 直接启动 GPT-Live，读一句开场口令，围绕真实场景练习。</p>
          </li>
          <li className="stepCard">
            <span className="stepNumber">02</span>
            <div className="stepIcon" aria-hidden="true">✦</div>
            <h3>退出 Voice 后复盘</h3>
            <p>复制深度复盘口令到同一 Chat，让它覆盖完整练习并只返回符合 EGLearn 契约的 JSON。</p>
          </li>
          <li className="stepCard">
            <span className="stepNumber">03</span>
            <div className="stepIcon" aria-hidden="true">↗</div>
            <h3>粘贴、确认、复习</h3>
            <p>复制 JSON，回到面板一键读取剪贴板并确认；需要时再导出到 Obsidian。</p>
          </li>
        </ol>
      </section>

      <ChatLiveLauncher />

      <ReviewDashboard />

      <section className="principles" id="principles" aria-labelledby="principles-title">
        <div>
          <span className="sectionKicker">产品边界</span>
          <h2 id="principles-title">先把最方便的路径做好。</h2>
        </div>
        <div className="principleList">
          <article>
            <span>01</span>
            <div><h3>Chat 就是练习入口</h3><p>使用 Plus 自带的 GPT-Live，不要求 API Key，也不消耗独立 API 额度。</p></div>
          </article>
          <article>
            <span>02</span>
            <div><h3>口语证据要诚实</h3><p>Voice 中直接听到的发音可以即时纠正；结束后如果没有可核对音频，EGLearn 会明确标记边界，不从文字猜发音。</p></div>
          </article>
          <article>
            <span>03</span>
            <div><h3>Obsidian 是可选出口</h3><p>EGLearn 自己保存进度，Obsidian 先做 Markdown 导出，不增加首日配置负担。</p></div>
          </article>
        </div>
      </section>

      <footer>
        <span>EGLearn</span>
        <div>
          <span>Built around your speaking habit, not another dashboard.</span>
          <a href="https://github.com/snozzz/eglearn/blob/main/docs/USER_GUIDE.md">使用指南</a>
          <a href="https://github.com/snozzz/eglearn/blob/main/PRIVACY.md">隐私</a>
        </div>
      </footer>
    </main>
  );
}
