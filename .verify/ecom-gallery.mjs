import { spawn } from "child_process";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9388;
const child = spawn(
  chrome,
  ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, "--hide-scrollbars", "about:blank"],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWs() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      const tabs = await res.json();
      const page = tabs.find((t) => t.type === "page") || tabs[0];
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("no cdp");
}

const ws = new WebSocket(await getWs());
let id = 0;
const pending = new Map();
ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
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
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});

const pages = [
  ["triangle-bikini-positano", 12, "/assets/coastlines/ecom/positano-01.jpg"],
  ["contour-bikini-ibiza", 9, "/assets/coastlines/ecom/ibiza-01.jpg"],
  ["cutout-one-piece-capri", 14, "/assets/coastlines/ecom/capri-one-01.jpg"],
];

for (const [slug, expected, ecom] of pages) {
  await send("Page.navigate", { url: `http://localhost:3000/product/${slug}` });
  await sleep(1800);
  const info = await send("Runtime.evaluate", {
    expression: `(() => {
      const slides = [...document.querySelectorAll("[data-gallery-stage] [data-slide]")];
      const visible = slides.find((slide) => getComputedStyle(slide).opacity !== "0");
      return {
        slides: slides.length,
        thumbs: document.querySelectorAll("[data-thumb]").length,
        visible: visible?.querySelector("img")?.getAttribute("src") || null,
        hasEcom: slides.some((slide) => slide.querySelector("img")?.getAttribute("src") === ${JSON.stringify(ecom)}),
      };
    })()`,
    returnByValue: true,
  });
  const value = info.result?.result?.value;
  console.log(slug, JSON.stringify(value), value?.slides === expected && value?.hasEcom ? "ok" : "MISMATCH");
  await send("Runtime.evaluate", {
    expression: `document.querySelector('[aria-label="Next image"]')?.click()`,
  });
  await sleep(400);
  const next = await send("Runtime.evaluate", {
    expression: `(() => {
      const slides = [...document.querySelectorAll("[data-gallery-stage] [data-slide]")];
      const visible = slides.find((slide) => Number(getComputedStyle(slide).opacity) > 0.5);
      return visible?.querySelector("img")?.getAttribute("src") || null;
    })()`,
    returnByValue: true,
  });
  console.log("  next", next.result?.result?.value);
}

ws.close();
child.kill();
