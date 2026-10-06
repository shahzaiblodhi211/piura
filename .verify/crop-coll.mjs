import sharp from "sharp";
import { rename, unlink } from "fs/promises";

const files = [
  "public/assets/home-coll-tops.jpg",
  "public/assets/home-coll-bottoms.jpg",
  "public/assets/home-coll-sun.jpg",
  "public/assets/home-coll-moon.jpg",
  "public/assets/home-coll-classics.jpg",
];

function isWhite(r, g, b) {
  return r > 242 && g > 242 && b > 242;
}

for (const file of files) {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const ch = info.channels;
  let top = 0;
  let bottom = h - 1;
  let left = 0;
  let right = w - 1;

  const rowHasPhoto = (y) => {
    let dark = 0;
    for (let x = 0; x < w; x += 4) {
      const i = (y * w + x) * ch;
      if (!isWhite(data[i], data[i + 1], data[i + 2])) dark++;
    }
    return dark > 8;
  };
  const colHasPhoto = (x) => {
    let dark = 0;
    for (let y = 0; y < h; y += 4) {
      const i = (y * w + x) * ch;
      if (!isWhite(data[i], data[i + 1], data[i + 2])) dark++;
    }
    return dark > 8;
  };

  while (top < h && !rowHasPhoto(top)) top++;
  while (bottom > top && !rowHasPhoto(bottom)) bottom--;
  while (left < w && !colHasPhoto(left)) left++;
  while (right > left && !colHasPhoto(right)) right--;

  const width = right - left + 1;
  const height = bottom - top + 1;
  console.log(file, `${w}x${h}`, "crop", left, top, width, height);
  if (top < 4 && left < 4 && h - bottom < 4 && w - right < 4) continue;

  const tmp = file + ".cropping";
  await sharp(file)
    .extract({ left, top, width, height })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(tmp);
  await unlink(file);
  await rename(tmp, file);
}
