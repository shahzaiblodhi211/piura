import sharp from "sharp";

const src = "public/assets/reserve-modal.jpg";
const meta = await sharp(src).metadata();
console.log(meta.width, meta.height);
const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
const w = info.width;
const h = info.height;
const ch = info.channels;

function isGutter(x, y) {
  const i = (y * w + x) * ch;
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  return r > 245 && g > 245 && b > 245;
}

const rowWhite = [];
for (let y = 0; y < h; y += 2) {
  let white = 0;
  for (let x = 0; x < w; x += 8) if (isGutter(x, y)) white++;
  rowWhite.push({ y, ratio: white / Math.ceil(w / 8) });
}
const guttersY = rowWhite.filter((row) => row.ratio > 0.85).map((row) => row.y);
console.log("y gutters sample", guttersY.filter((_, i) => i % 4 === 0).join(","));

const colWhite = [];
for (let x = 0; x < w; x += 2) {
  let white = 0;
  const samples = 40;
  for (let s = 0; s < samples; s++) {
    const y = Math.floor((s / samples) * h);
    if (isGutter(x, y)) white++;
  }
  if (white / samples > 0.7) colWhite.push(x);
}
console.log("x gutters", colWhite.filter((x, i, arr) => i === 0 || x - arr[i - 1] > 6).join(","));
