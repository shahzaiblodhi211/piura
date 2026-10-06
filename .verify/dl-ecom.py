import re
import urllib.request
from pathlib import Path

log = Path(
    r"C:\Users\Shahmeer\.cursor\projects\c-Users-Shahmeer-projects-piura\terminals\190253.txt"
).read_text(encoding="utf-8", errors="replace")

items = []
seen = set()
for fid, name in re.findall(r"Processing file (\S+) (.+)", log):
    name = name.strip()
    key = (fid, name)
    if key in seen:
        continue
    seen.add(key)
    items.append(key)

slug_map = {
    "Contour Bikini - Capri": "capri-contour",
    "Contour Bikini - Ibiza": "ibiza",
    "Contour Bikini - Malibu": "malibu",
    "Cutout One-piece - Capri": "capri-one",
    "Cutout One-piece - Mykonos": "mykonos-one",
    "Triangle Bikini - Ipanema": "ipanema",
    "Triangle Bikini - Positano": "positano",
}

out = Path(".verify/ecom-raw")
out.mkdir(parents=True, exist_ok=True)

counts = {}
jobs = []
for fid, name in items:
    slug = slug_map[name]
    counts[slug] = counts.get(slug, 0) + 1
    dest = out / f"{slug}-{counts[slug]:02d}"
    jobs.append((fid, dest))

print(f"files {len(jobs)}", flush=True)
for slug, count in counts.items():
    print(f"  {slug} {count}", flush=True)

for index, (fid, dest) in enumerate(jobs, 1):
    if dest.exists() and dest.stat().st_size > 100_000:
        print(f"[{index}/{len(jobs)}] skip {dest.name} {dest.stat().st_size}", flush=True)
        continue
    url = f"https://drive.usercontent.google.com/download?id={fid}&export=download&confirm=t"
    print(f"[{index}/{len(jobs)}] {dest.name}", flush=True)
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=120) as response:
        data = response.read()
        kind = response.headers.get("Content-Type", "")
    png = data[:8] == b"\x89PNG\r\n\x1a\n"
    jpeg = data[:2] == b"\xff\xd8"
    heic = b"ftyp" in data[:16]
    if not (png or jpeg or heic) or len(data) < 100_000:
        raise SystemExit(f"bad download {dest.name} {kind} {len(data)} {data[:16]!r}")
    dest.write_bytes(data)
    print(f"  saved {len(data)} {kind}", flush=True)
