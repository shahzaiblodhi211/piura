import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9403;
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
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await send("Page.navigate", { url: "http://localhost:3000/" });
await sleep(1800);

const before = await send("Runtime.evaluate", {
  expression: `(() => {
    const buttons = [...document.querySelectorAll("header button")];
    const menu = buttons.find((b) => /menu/i.test(b.getAttribute("aria-label") || b.textContent));
    const search = buttons.find((b) => /search/i.test(b.getAttribute("aria-label") || ""));
    const logo = document.querySelector("header a[aria-label='Piura Swim']");
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { l: Math.round(r.left), r: Math.round(r.right), lines: el.querySelectorAll("span.block").length };
    };
    return { menu: box(menu), search: box(search), logo: box(logo) };
  })()`,
  returnByValue: true,
});
console.log("closed", JSON.stringify(before.result?.result?.value));

await send("Runtime.evaluate", {
  expression: `document.querySelector("header button[aria-controls='mobile-nav']").click()`,
});
await sleep(700);
const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 60 });
writeFileSync("c:/Users/Shahmeer/projects/piura/.verify/menu-open.jpg", Buffer.from(shot.result.data, "base64"));

const open = await send("Runtime.evaluate", {
  expression: `(() => {
    const nav = document.getElementById("mobile-nav");
    const r = nav.getBoundingClientRect();
    const btn = [...nav.querySelectorAll("a")].find((a) => /waitlist/i.test(a.textContent));
    const cs = getComputedStyle(btn);
    return {
      navL: Math.round(r.left),
      navW: Math.round(r.width),
      navH: Math.round(r.height),
      border: cs.borderTopColor + " " + cs.borderTopWidth,
      label: btn.textContent.trim(),
    };
  })()`,
  returnByValue: true,
});
console.log("open", JSON.stringify(open.result?.result?.value));
ws.close();
child.kill();
