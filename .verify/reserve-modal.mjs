import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9410;
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

async function check(width, file) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 844, deviceScaleFactor: 1, mobile: width < 800 });
  await send("Page.navigate", { url: "http://localhost:3000/product/contour-bikini-malibu" });
  await sleep(1800);
  await send("Runtime.evaluate", {
    expression: `(() => { const b = document.getElementById("reserve-yours"); b?.scrollIntoView({block:"center"}); b?.click(); })()`,
  });
  await sleep(900);
  const measure = await send("Runtime.evaluate", {
    expression: `(() => {
      const img = document.querySelector("#reserve-dialog img[src*='reserve-modal']");
      const inputs = [...document.querySelectorAll("#reserve-dialog input")];
      const btn = document.querySelector("#reserve-dialog button[type='submit']");
      const ir = img.getBoundingClientRect();
      const boxes = inputs.map((el) => {
        const r = el.getBoundingClientRect();
        return { t: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width) };
      });
      const br = btn.getBoundingClientRect();
      const dialog = document.getElementById("reserve-dialog").getBoundingClientRect();
      return {
        img: { w: Math.round(ir.width), h: Math.round(ir.height), overflow: ir.right > dialog.right + 1 },
        inputs: boxes,
        gap: boxes.length === 2 ? Math.round(boxes[1].t - (boxes[0].t + boxes[0].h)) : null,
        btnGap: boxes.length ? Math.round(br.top - (boxes[1].t + boxes[1].h)) : null,
        dialogW: Math.round(dialog.width),
      };
    })()`,
    returnByValue: true,
  });
  console.log(width, JSON.stringify(measure.result?.result?.value));
  const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 55 });
  writeFileSync(file, Buffer.from(shot.result.data, "base64"));
}

await check(390, "c:/Users/Shahmeer/projects/piura/.verify/reserve-390.jpg");
await check(1280, "c:/Users/Shahmeer/projects/piura/.verify/reserve-1280.jpg");
ws.close();
child.kill();
