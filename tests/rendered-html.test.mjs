import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the EGLearn product shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>英语口语练习记录 · EGLearn<\/title>/i);
  assert.match(html, /每次开口/);
  assert.match(html, /ChatGPT Plus/);
  assert.match(html, /无需 OpenAI API/);
  assert.match(html, /Chat \+ GPT-Live/);
  assert.match(html, /先开 Voice，再开始练/);
  assert.match(html, /复制完整复盘口令/);
  assert.match(html, /Obsidian 是可选出口/);
  assert.match(html, /把这次练习留下来/);
  assert.match(html, /从剪贴板读取并检查/);
  assert.match(html, /从 Chat 导入/);
  assert.doesNotMatch(html, /Action 自动保存到你的私人记录/);
  assert.doesNotMatch(html, /在 Custom GPT 里说/);
  assert.match(html, /从记录里看趋势/);
  assert.match(html, /没有练习机会，不判断“已掌握”/);
  assert.match(html, /Obsidian 设置/);
  assert.match(html, /下载 \/ 复制始终可用/);
  assert.match(html, /记录与缓存/);
});
