import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9405;
const child = spawn(chrome, ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, "--window-size=1400,900", "about:blank"], { stdio: "ignore" });
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
await send("Network.enable");
await send("Page.navigate", { url: "https://www.canva.com/design/DAHULQ3cbEo/74nBguJ4b12UKDe3l6FvzQ/view?utm_content=DAHULQ3cbEo&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" });
await sleep(8000);
const info = await send("Runtime.evaluate", {
  expression: `(() => ({ title: document.title, url: location.href, text: document.body.innerText.slice(0, 4000) }))()`,
  returnByValue: true,
});
console.log(JSON.stringify(info.result?.result?.value, null, 2));
const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 40 });
writeFileSync("c:/Users/Shahmeer/projects/piura/.verify/canva-1.jpg", Buffer.from(shot.result.data, "base64"));
ws.close();
child.kill();
