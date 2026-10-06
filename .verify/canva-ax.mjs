import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9408;
const child = spawn(chrome, ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, "--window-size=1440,900", "about:blank"], { stdio: "ignore" });
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
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const next = ++id;
    pending.set(next, resolve);
    ws.send(JSON.stringify({ id: next, method, params }));
  });
await send("Page.enable");
await send("Runtime.enable");
await send("Accessibility.enable");
await send("Page.navigate", { url: "https://www.canva.com/design/DAHULQ3cbEo/74nBguJ4b12UKDe3l6FvzQ/view" });
await sleep(12000);
const tree = await send("Accessibility.getFullAXTree");
const nodes = tree.result?.nodes || [];
const names = [];
for (const node of nodes) {
  const name = node.name?.value || "";
  if (name && name.length < 120 && /[A-Za-z]/.test(name)) names.push(name.replace(/\s+/g, " ").trim());
}
const unique = [...new Set(names)];
writeFileSync(".verify/canva-ax.txt", unique.join("\n"));
console.log("nodes", nodes.length, "names", unique.length);
console.log(unique.filter((n) => /bikini|piece|tote|ipanema|positano|mykonos|malibu|ibiza|capri|coast|page|slide|\$/i.test(n)).join("\n"));
const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 40 });
writeFileSync(".verify/canva-3.jpg", Buffer.from(shot.result.data, "base64"));
ws.close();
child.kill();
