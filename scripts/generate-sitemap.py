#!/usr/bin/env python3
"""Vygeneruje sitemap.xml z veřejných HTML stránek a historie Gitu."""

from __future__ import annotations

import argparse
import html
import os
import subprocess
from datetime import date
from pathlib import Path
from urllib.parse import quote


ROOT = Path(__file__).resolve().parent.parent
SITEMAP_PATH = ROOT / "sitemap.xml"
BASE_URL = "https://invictus2011.cz"
EXCLUDED_PAGES = {"404.html"}

# Pořadí současně určuje pořadí hlavních stránek v sitemapě.
PAGE_SETTINGS = {
    "index.html": ("weekly", "1.0"),
    "novinky.html": ("weekly", "0.9"),
    "historie.html": ("yearly", "0.9"),
    "soupiska.html": ("monthly", "0.9"),
    "galerie.html": ("monthly", "0.8"),
    "souteze.html": ("monthly", "0.8"),
    "havirovska-liga.html": ("monthly", "0.8"),
    "karvinska-liga.html": ("yearly", "0.7"),
    "ostravska-liga.html": ("monthly", "0.8"),
    "historie-dresu.html": ("yearly", "0.7"),
    "spustili-jsme-novy-web.html": ("yearly", "0.8"),
    "nove-dresy-2026-27.html": ("yearly", "0.8"),
    "invi-cup-2026.html": ("weekly", "0.9"),
}


def public_pages() -> list[Path]:
    pages = [
        path.relative_to(ROOT)
        for path in ROOT.rglob("*.html")
        if path.name not in EXCLUDED_PAGES
        and not any(part.startswith(".") for part in path.relative_to(ROOT).parts)
        and "node_modules" not in path.parts
    ]

    order = {name: index for index, name in enumerate(PAGE_SETTINGS)}
    return sorted(
        pages,
        key=lambda path: (order.get(path.as_posix(), len(order)), path.as_posix()),
    )


def last_modified(path: Path) -> str:
    git_ref = os.environ.get("SITEMAP_GIT_REF", "HEAD")
    command = [
        "git",
        "log",
        "-1",
        "--format=%cs",
        git_ref,
        "--",
        path.as_posix(),
    ]

    try:
        result = subprocess.run(
            command,
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        modified = result.stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        modified = ""

    return modified or date.today().isoformat()


def page_url(path: Path) -> str:
    if path.as_posix() == "index.html":
        return f"{BASE_URL}/"
    return f"{BASE_URL}/{quote(path.as_posix())}"


def generate_sitemap() -> str:
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    for path in public_pages():
        changefreq, priority = PAGE_SETTINGS.get(
            path.as_posix(),
            ("monthly", "0.7"),
        )
        lines.extend(
            [
                "  <url>",
                f"    <loc>{html.escape(page_url(path))}</loc>",
                f"    <lastmod>{last_modified(path)}</lastmod>",
                f"    <changefreq>{changefreq}</changefreq>",
                f"    <priority>{priority}</priority>",
                "  </url>",
            ]
        )

    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="Pouze ověří, zda je sitemap.xml aktuální.",
    )
    args = parser.parse_args()
    generated = generate_sitemap()
    current = SITEMAP_PATH.read_text(encoding="utf-8") if SITEMAP_PATH.exists() else ""

    if args.check:
        if current == generated:
            print("sitemap.xml je aktuální.")
            return 0
        print("sitemap.xml potřebuje aktualizaci.")
        return 1

    if current == generated:
        print("sitemap.xml je aktuální, není co měnit.")
        return 0

    SITEMAP_PATH.write_text(generated, encoding="utf-8")
    print(f"sitemap.xml aktualizována: {len(public_pages())} stránek.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
