import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9406;
const child = spawn(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    `--remote-debugging-port=${port}`,
    "--window-size=1440,900",
    "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "about:blank",
  ],
  { stdio: "ignore" },
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getWs() {
  for (let i = 0; i < 40; i++) {
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
const urls = [];
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.method === "Network.responseReceived") {
    const u = msg.params?.response?.url || "";
    if (/page|slide|document|media|export/i.test(u)) urls.push(u.slice(0, 180));
  }
  if (msg.id && pending.has(msg.id)) pending.get(msg.id)(msg);
});
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve);
  ws.addEventListener("error", reject);
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const next = ++id;
    pending.set(next, resolve);
    ws.send(JSON.stringify({ id: next, method, params }));
  });
await send("Page.enable");
await send("Runtime.enable");
await send("Network.enable");
await send("Page.navigate", {
  url: "https://www.canva.com/design/DAHULQ3cbEo/74nBguJ4b12UKDe3l6FvzQ/view",
});
await sleep(14000);
const info = await send("Runtime.evaluate", {
  expression: `(() => ({
    title: document.title,
    url: location.href,
    text: (document.body.innerText || "").replace(/\\s+/g, " ").slice(0, 1500),
    canvases: document.querySelectorAll("canvas").length,
    imgs: document.querySelectorAll("img").length,
    buttons: [...document.querySelectorAll("button")].slice(0, 12).map((b) => b.innerText.trim()).filter(Boolean),
  }))()`,
  returnByValue: true,
});
console.log(JSON.stringify(info.result?.result?.value, null, 2));
console.log("URLS", urls.slice(0, 30).join("\n"));
const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 45 });
writeFileSync("c:/Users/Shahmeer/projects/piura/.verify/canva-2.jpg", Buffer.from(shot.result.data, "base64"));
ws.close();
child.kill();
