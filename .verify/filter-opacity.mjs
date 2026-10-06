import { spawn } from "child_process";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9418;
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

async function readGrid() {
  const res = await send("Runtime.evaluate", {
    expression: `(() => {
      const shown = [...document.querySelectorAll("[data-product-wrap]")].filter((el) => el.dataset.shown === "true");
      const sample = shown.slice(0, 4).map((el) => {
        const img = el.querySelector("img");
        const cs = getComputedStyle(el);
        const ics = img ? getComputedStyle(img) : null;
        const photo = el.querySelector("[data-photo]");
        const pcs = photo ? getComputedStyle(photo) : null;
        const name = el.querySelector("[data-product-name]");
        const ncs = name ? getComputedStyle(name) : null;
        return {
          name: el.dataset.name,
          wrap: cs.opacity,
          img: ics?.opacity,
          clip: pcs?.clipPath,
          nameOp: ncs?.opacity,
          imgH: img ? Math.round(img.getBoundingClientRect().height) : 0,
        };
      });
      const footer = [...document.querySelectorAll("footer a")].map((a) => a.textContent.replace(/\\s+/g, " ").trim()).filter(Boolean);
      const active = [...document.querySelectorAll("[data-tab]")].find((el) => el.getAttribute("aria-pressed") === "true")?.textContent.replace(/\\s+/g, " ").trim();
      return { count: shown.length, active, sample, footer };
    })()`,
    returnByValue: true,
  });
  return res.result?.result?.value;
}

await send("Page.navigate", { url: "http://localhost:3000/shop?filter=sara" });
await sleep(2200);
console.log("land sara", JSON.stringify(await readGrid(), null, 2));

for (const label of ["Bandeau", "Triangle", "Classics", "All Swim", "One-Piece", "Coastlines"]) {
  await send("Runtime.evaluate", {
    expression: `(() => {
      const tab = [...document.querySelectorAll("[data-tab]")].find((el) => el.textContent.replace(/\\s+/g, " ").includes(${JSON.stringify(label)}));
      tab?.click();
    })()`,
  });
  await sleep(280);
}
await sleep(1200);
console.log("after rapid", JSON.stringify(await readGrid(), null, 2));

await send("Runtime.evaluate", {
  expression: `(() => {
    const link = [...document.querySelectorAll("footer a")].find((a) => a.textContent.replace(/\\s+/g, " ").trim().toUpperCase().includes("BANDEAU"));
    link?.click();
  })()`,
});
await sleep(1800);
console.log("footer bandeau", JSON.stringify(await readGrid(), null, 2));
child.kill();
ws.close();
