import { spawn } from "child_process";
import { writeFileSync } from "fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9356;
const child = spawn(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    `--remote-debugging-port=${port}`,
    "--hide-scrollbars",
    "about:blank",
  ],
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
await send("Runtime.setAsyncCallStackDepth", { maxDepth: 4 });
ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  if (msg.method === "Runtime.exceptionThrown") {
    console.log("EXC", msg.params.exceptionDetails?.text, msg.params.exceptionDetails?.exception?.description);
  }
});
const shot = async (name) => {
  const cap = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(
    `c:/Users/Shahmeer/projects/piura/.verify/${name}.png`,
    Buffer.from(cap.result.data, "base64"),
  );
};
await send("Emulation.setDeviceMetricsOverride", {
  width: 1560,
  height: 980,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Page.navigate", {
  url: "http://localhost:3000/product/sunchild-triangle-bottom",
});
await sleep(5000);
await send("Runtime.evaluate", {
  expression: `document.getElementById("reserve-yours")?.scrollIntoView({ block: "center" })`,
});
await sleep(400);
const box = await send("Runtime.evaluate", {
  expression: `(() => {
    const el = document.getElementById("reserve-yours");
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, top: r.top };
  })()`,
  returnByValue: true,
});
console.log("box", box.result.result.value);
await send("Input.dispatchMouseEvent", {
  type: "mousePressed",
  x: box.result.result.value.x,
  y: box.result.result.value.y,
  button: "left",
  clickCount: 1,
});
await send("Input.dispatchMouseEvent", {
  type: "mouseReleased",
  x: box.result.result.value.x,
  y: box.result.result.value.y,
  button: "left",
  clickCount: 1,
});
await sleep(900);
const after = await send("Runtime.evaluate", {
  expression: `Boolean(document.getElementById("reserve-dialog"))`,
  returnByValue: true,
});
const href = await send("Runtime.evaluate", {
  expression: `location.pathname + ' ' + (document.getElementById("reserve-yours") ? "btn" : "nobtn") + ' ' + document.title`,
  returnByValue: true,
});
console.log("after mouse", after.result.result.value, href.result.result.value);
const listed = await send("Runtime.evaluate", {
  expression: `(() => {
    const buttons = [...document.querySelectorAll("button, a")].map((el) => el.textContent.replace(/\\s+/g, " ").trim());
    const large = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "LARGE");
    large?.click();
    const reserve = document.getElementById("reserve-yours");
    reserve?.scrollIntoView({ block: "center" });
    reserve?.click();
    const keys = reserve ? Object.keys(reserve).filter((k) => k.includes("react") || k.startsWith("__")) : [];
    const largeActive = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "LARGE")?.className.includes("border-olive");
    return { clicked: Boolean(reserve), largeActive, id: reserve?.id, keys };
  })()`,
  returnByValue: true,
});
console.log(JSON.stringify(listed.result.result.value, null, 2));
const err = await send("Runtime.evaluate", {
  expression: `(() => {
    const portal = document.querySelector("nextjs-portal");
    const text = portal?.shadowRoot?.textContent || portal?.textContent || "";
    const reserve = document.getElementById("reserve-yours");
    const propKey = reserve && Object.keys(reserve).find((k) => k.startsWith("__reactProps"));
    const fiberKey = reserve && Object.keys(reserve).find((k) => k.startsWith("__reactFiber"));
    const props = propKey ? reserve[propKey] : null;
    const fiber = fiberKey ? reserve[fiberKey] : null;
    let called = "no";
    try {
      const click = fiber?.memoizedProps?.onClick || props?.onClick;
      if (typeof click === "function") {
        click({ preventDefault() {}, stopPropagation() {}, nativeEvent: { stopImmediatePropagation() {} } });
        called = "yes";
      } else {
        called = typeof click;
      }
    } catch (error) {
      called = String(error);
    }
    return { called };
  })()`,
  returnByValue: true,
});
console.log("err", err.result.result.value);
await sleep(800);
const info = await send("Runtime.evaluate", {
  expression: `(() => {
    const dialog = document.querySelector("[role='dialog']");
    const box = dialog?.getBoundingClientRect();
    return {
      open: Boolean(dialog),
      title: dialog?.querySelector("h2")?.textContent,
      large: [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "LARGE")?.getAttribute("class"),
      w: box ? Math.round(box.width) : 0,
      h: box ? Math.round(box.height) : 0,
    };
  })()`,
  returnByValue: true,
});
console.log(info.result.result.value);
await shot("reserve-d");
ws.close();
child.kill();
