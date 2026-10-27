#!/usr/bin/env python3
"""Safely add the JARVIS 3.0 CSS link to an existing index.html."""
from pathlib import Path
import shutil
import sys

path = Path(sys.argv[1] if len(sys.argv) > 1 else "index.html")
if not path.exists():
    raise SystemExit(f"Can't find {path}. Run this script from your project folder or pass the index.html path.")
html = path.read_text(encoding="utf-8")
link = '<link rel="stylesheet" href="/jarvis-live.css?v=3">'
if link in html:
    print("JARVIS 3.0 stylesheet link already exists.")
    raise SystemExit(0)
if "</head>" not in html.lower():
    raise SystemExit("Couldn't find </head> in index.html; no changes made.")
backup = path.with_suffix(path.suffix + ".backup")
shutil.copy2(path, backup)
pos = html.lower().rfind("</head>")
html = html[:pos] + "  " + link + "\n" + html[pos:]
path.write_text(html, encoding="utf-8")
print(f"Updated {path}; original backed up to {backup}")
