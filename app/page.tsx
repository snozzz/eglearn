import type { Metadata } from "next";
import { ReviewDashboard } from "./review-dashboard";

export const metadata: Metadata = {
  title: "英语口语练习记录",
  description: "用 ChatGPT Plus 练口语，并把复盘自动同步到 EGLearn。",
};

export default function Home() {
  return (
    <main className="shell">
      <nav className="topbar" aria-label="主导航">
        <a className="brand" href="#top" aria-label="EGLearn 首页">
          <span className="brandMark" aria-hidden="true">e</span>
          <span>EGLearn</span>
        </a>
        <span className="buildBadge">Plus + Action · v1.1</span>
      </nav>

      <section className="hero" id="top">
        <div className="eyebrow">Speak · Notice · Improve</div>
        <h1>每次开口，<br />都留下进步的证据。</h1>
        <p className="heroCopy">
          在 ChatGPT Plus 里练口语，退出 Voice 后让 Action 自动保存关键纠错、
          好表达与下一次任务。无需 OpenAI API，也无需额外购买模型额度。
        </p>
        <div className="heroActions">
          <a className="primaryButton" href="#workflow">看看怎么工作</a>
          <a className="textButton" href="#principles">产品原则 <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section className="workflow" id="workflow" aria-labelledby="workflow-title">
        <div className="sectionHeading">
          <span>最短使用路径</span>
          <h2 id="workflow-title">一个入口，三步完成</h2>
        </div>
        <ol className="stepGrid">
          <li className="stepCard">
            <span className="stepNumber">01</span>
            <div className="stepIcon" aria-hidden="true">◉</div>
            <h3>在 Custom GPT 里说</h3>
            <p>用 Plus 账号进入语音对话，围绕一个真实场景练习约 10 分钟。</p>
          </li>
          <li className="stepCard">
            <span className="stepNumber">02</span>
            <div className="stepIcon" aria-hidden="true">✦</div>
            <h3>退出语音后保存</h3>
            <p>回到同一聊天发送“复盘并保存”，GPT 生成有原句证据的反馈并调用私人 Action。</p>
          </li>
          <li className="stepCard">
            <span className="stepNumber">03</span>
            <div className="stepIcon" aria-hidden="true">↗</div>
            <h3>自动同步并复习</h3>
            <p>复盘自动出现在面板，重复调用不会产生副本；需要时再导出 Markdown 到 Obsidian。</p>
          </li>
        </ol>
      </section>

      <ReviewDashboard />

      <section className="principles" id="principles" aria-labelledby="principles-title">
        <div>
          <span className="sectionKicker">产品边界</span>
          <h2 id="principles-title">先把最方便的路径做好。</h2>
        </div>
        <div className="principleList">
          <article>
            <span>01</span>
            <div><h3>Plus 就是练习入口</h3><p>不要求 API Key，不把 ChatGPT 订阅伪装成 API 额度。</p></div>
          </article>
          <article>
            <span>02</span>
            <div><h3>记录要可核对</h3><p>纠错必须引用学习者原句；无法从转写判断的发音不乱打分。</p></div>
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
