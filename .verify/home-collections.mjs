import { spawn } from "child_process";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9416;
const child = spawn(chrome, ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getWs() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      const tabs = await res.json();
      const page = tabs.find((t) => t.type === "page") || tabs[0];
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error("no cdp");
}
const ws = new WebSocket(await getWs());
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) pending.get(msg.id)(msg);
});
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve);
  ws.addEventListener("error", reject);
});
const send = (method, params = {}) => new Promise((resolve) => {
  const next = ++id;
  pending.set(next, resolve);
  ws.send(JSON.stringify({ id: next, method, params }));
});
await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "http://localhost:3000/" });
await sleep(2000);
const home = await send("Runtime.evaluate", {
  expression: `(() => {
    const cats = [...document.querySelectorAll("a")].filter((a) => a.querySelector("span.font-bebas") && a.className.includes("bg-[#f6f1ee]")).map((a) => ({ label: a.innerText.replace(/\\s+/g, " ").trim(), href: a.getAttribute("href") }));
    const tiles = [...document.querySelectorAll("a")].filter((a) => a.querySelector("span.underline")).map((a) => ({ label: a.innerText.replace(/\\s+/g, " ").trim(), href: a.getAttribute("href") }));
    return { cats, tiles, tote: !!document.querySelector("#tote") };
  })()`,
  returnByValue: true,
});
console.log("home", JSON.stringify(home.result?.result?.value, null, 2));

const checks = ["coastlines", "classics", "tops", "bottoms", "sunchild", "moonchild", "sara", "bali", "marina", "triangle", "bandeau"];
for (const filter of checks) {
  await send("Page.navigate", { url: `http://localhost:3000/shop?filter=${filter}` });
  await sleep(700);
  const grid = await send("Runtime.evaluate", {
    expression: `(() => {
      const active = [...document.querySelectorAll("[data-tab]")].find((el) => el.getAttribute("aria-pressed") === "true")?.textContent.replace(/\\s+/g, " ").trim();
      const names = [...document.querySelectorAll("[data-product-wrap]")].filter((el) => el.dataset.shown === "true").map((el) => el.dataset.name);
      return { active, count: names.length, names };
    })()`,
    returnByValue: true,
  });
  const value = grid.result?.result?.value;
  console.log(filter, value?.active, value?.count, (value?.names || []).join(" | "));
}
child.kill();
ws.close();
