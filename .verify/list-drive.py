import re
import urllib.request

folders = {
    "Bali Bikini": "1iYz5DSdc92NWldos_Ydirs_EzerGUseN",
    "Bella Bikini": "1jv-FPtws63gjb00TZsEGBxEMXNdvGQcq",
    "Marina Bandeau Kini": "1AeCcu887aj9YlV4573qwxIXg2THNvzZ-",
    "Sara Bikini": "1cgdDQsWUs8qtVwBtFmTishOij0rIm9Sl",
    "Ecom photos": "1QzzkXYVW3Wj98rjZ5d6swM4OVd_svZFn",
    "Piura Photos": "1Bvl4gqXYNYl3hv1UFQmWHfeZCWtKe7EK",
    "Website photos": "1UiGDT9cpsExw4-rR7ugwTip1slOZQU4C",
}

def listing(fid):
    url = f"https://drive.google.com/embeddedfolderview?id={fid}"
    html = urllib.request.urlopen(url, timeout=60).read().decode("utf-8", "replace")
    entries = re.findall(
        r'href="https://drive.google.com/(?:drive/folders|file/d)/([^"/]+)".*?<div class="flip-entry-title">([^<]+)</div>',
        html,
        re.S,
    )
    # fallback titles
    titles = re.findall(r'class="flip-entry-title">([^<]+)</div>', html)
    ids = re.findall(r'id="entry-([^"]+)"', html)
    hrefs = re.findall(r'href="(https://drive.google.com/[^"]+)"', html)
    return list(zip(titles, ids, hrefs))

for name, fid in folders.items():
    rows = listing(fid)
    print(f"\n== {name} ({len(rows)}) ==")
    for title, eid, href in rows:
        kind = "DIR" if "/folders/" in href else "FILE"
        print(f"  {kind} {title} {eid}")
