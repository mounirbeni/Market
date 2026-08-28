from pathlib import Path
from io import BytesIO
import requests
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "brands"
BASE = "https://www.carlogos.org"
# Exact carlogos.org image paths for car brands present in the Market Maroc catalog.
# The files are vendored locally so the production UI does not depend on a third-party CDN.
SLUGS = [
    "abarth", "alfa-romeo", "alpine", "aston-martin", "baic", "byd", "bentley",
    "changan", "chery", "cupra", "deepal", "dfsk", "ds", "dongfeng", "exeed",
    "ferrari", "foton", "gaz", "gwm", "geely", "jac", "jaecoo", "jaguar",
    "jetour", "kgm", "leapmotor", "lexus", "lynk-co", "mg", "mahindra",
    "maserati", "mazda", "mini", "neo-motors", "omoda", "porsche", "rox",
    "seres", "smart", "soueast", "ssangyong", "subaru", "tata", "volvo",
    "xpeng", "zeekr",
]

session = requests.Session()
session.headers.update({
    "User-Agent": "Market-Maroc-brand-assets/1.0 (+https://github.com/mounirbeni/Market)",
    "Referer": f"{BASE}/car-brands/",
})

OUT.mkdir(parents=True, exist_ok=True)
for slug in SLUGS:
    remote = f"{BASE}/car-logos/{slug}-logo.png"
    response = session.get(remote, timeout=25)
    response.raise_for_status()
    content = response.content
    if not content.startswith(b"\x89PNG\r\n\x1a\n"):
        print(f"skipped {slug}.png (carlogos.org returned no PNG at this path)")
        continue
    with Image.open(BytesIO(content)) as image:
        image.verify()
    destination = OUT / f"{slug}.png"
    destination.write_bytes(content)
    print(f"downloaded {slug}.png ({len(content) // 1024} KB)")
