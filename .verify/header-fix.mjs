import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9362;
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
const shot = async (name) => {
  const cap = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`c:/Users/Shahmeer/projects/piura/.verify/${name}.png`, Buffer.from(cap.result.data, "base64"));
};
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Page.navigate", { url: "http://localhost:3000/" });
await sleep(3500);
const info = await send("Runtime.evaluate", {
  expression: `(() => {
    const link = document.querySelector("header nav a");
    const mark = document.querySelector('header a[aria-label="Piura Swim"] span');
    const cs = link ? getComputedStyle(link) : null;
    const box = mark ? mark.getBoundingClientRect() : null;
    const imgs = [...document.querySelectorAll("[data-photo] img")].map((img) => img.style.transform || getComputedStyle(img).transform);
    return {
      nav: cs && { family: cs.fontFamily, size: cs.fontSize, weight: cs.fontWeight },
      logo: box && { w: Math.round(box.width), h: Math.round(box.height) },
      search: !!document.querySelector('header button[aria-label="Search"]'),
      photoTransforms: imgs.slice(0, 4),
      scrub: document.body.innerHTML.includes("yPercent"),
    };
  })()`,
  returnByValue: true,
});
console.log(JSON.stringify(info.result?.result?.value ?? info, null, 2));
await shot("h-hero");
const click = await send("Runtime.evaluate", {
  expression: `document.querySelector('header button[aria-label="Search"]').click(); "clicked"`,
  returnByValue: true,
});
await sleep(400);
const search = await send("Runtime.evaluate", {
  expression: `({
    open: !!document.querySelector('header input'),
    placeholder: document.querySelector('header input')?.placeholder || "",
    links: document.querySelectorAll("header ul a").length,
  })`,
  returnByValue: true,
});
console.log("search", JSON.stringify(search.result?.result?.value));
console.log("click", click.result?.result?.value);
await shot("h-search");
await send("Runtime.evaluate", {
  expression: `(() => {
    const el = [...document.querySelectorAll("h2")].find((n) => n.textContent.includes("OUR COLLECTION"));
    if (el) el.scrollIntoView({ block: "center" });
  })()`,
});
await sleep(900);
const tiles = await send("Runtime.evaluate", {
  expression: `(() => {
    const tile = document.querySelector('[data-photo="still"]');
    const img = tile?.querySelector("img");
    return {
      tileOpacity: tile ? getComputedStyle(tile).opacity : null,
      imgTransform: img ? getComputedStyle(img).transform : null,
      tileTransform: tile ? getComputedStyle(tile).transform : null,
    };
  })()`,
  returnByValue: true,
});
console.log("tiles", JSON.stringify(tiles.result?.result?.value));
await shot("h-coll");
ws.close();
child.kill();
