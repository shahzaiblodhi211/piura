import sharp from "sharp";

const src = "public/assets/reserve-modal.jpg";
const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
const w = info.width;
const h = info.height;
const ch = info.channels;

function pix(x, y) {
  const i = (y * w + x) * ch;
  return [data[i], data[i + 1], data[i + 2]];
}

const topH = 540;
const cols = [];
for (let x = 0; x < w; x++) {
  let light = 0;
  const samples = 30;
  for (let s = 1; s < samples; s++) {
    const y = Math.floor((s / samples) * topH);
    const [r, g, b] = pix(x, y);
    if (r > 230 && g > 230 && b > 230) light++;
  }
  if (light / samples > 0.6) cols.push(x);
}
const bands = [];
let start = cols[0];
let prev = cols[0];
for (const x of cols.slice(1)) {
  if (x - prev > 3) {
    bands.push([start, prev]);
    start = x;
  }
  prev = x;
}
if (start != null) bands.push([start, prev]);
console.log("top vertical light bands", bands);

const rows = [];
for (let y = 0; y < h; y++) {
  let light = 0;
  const step = 12;
  let n = 0;
  for (let x = 0; x < w; x += step) {
    n++;
    const [r, g, b] = pix(x, y);
    if (r > 230 && g > 230 && b > 230) light++;
  }
  if (light / n > 0.75) rows.push(y);
}
const rbands = [];
start = rows[0];
prev = rows[0];
for (const y of rows.slice(1)) {
  if (y - prev > 3) {
    rbands.push([start, prev]);
    start = y;
  }
  prev = y;
}
if (start != null) rbands.push([start, prev]);
console.log("horizontal light bands", rbands);

const mid = Math.floor(w / 2);
console.log("sample mid top", pix(mid, 200), "sample gutter guess", pix(510, 200), pix(512, 200), pix(500, 280));
