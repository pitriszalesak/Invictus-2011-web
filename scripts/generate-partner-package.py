#!/usr/bin/env python3
"""Vygeneruje jednostránkový partnerský balíček Invictus 2011."""

from pathlib import Path

from PIL import Image
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "partnersky-balicek-invictus-2011-2026-27.pdf"
TEMP_ASSETS = ROOT / "tmp" / "pdfs" / "partner-package-assets"

BLACK = HexColor("#090909")
PANEL = HexColor("#151515")
PANEL_ALT = HexColor("#1B1A17")
WHITE = HexColor("#F7F5EF")
CREAM = HexColor("#E7E2D7")
MUTED = HexColor("#A9A59B")
GOLD = HexColor("#C7A34D")
GOLD_LIGHT = HexColor("#EAD18F")
LINE = Color(1, 1, 1, alpha=0.13)


def register_fonts():
    font_dir = Path("/usr/share/fonts/truetype/dejavu")
    fonts = {
        "Invictus": font_dir / "DejaVuSans.ttf",
        "Invictus-Bold": font_dir / "DejaVuSans-Bold.ttf",
        "Invictus-Condensed": font_dir / "DejaVuSans.ttf",
        "Invictus-Condensed-Bold": font_dir / "DejaVuSans-Bold.ttf",
    }
    for name, path in fonts.items():
        if not path.exists():
            raise FileNotFoundError(f"Chybí font: {path}")
        pdfmetrics.registerFont(TTFont(name, str(path)))


def fit_image(c, path, x, y, width, height, preserve_alpha=True):
    path = Path(path)
    with Image.open(path) as image:
        image_width, image_height = image.size
    scale = min(width / image_width, height / image_height)
    drawn_width = image_width * scale
    drawn_height = image_height * scale
    c.drawImage(
        ImageReader(str(path)),
        x + (width - drawn_width) / 2,
        y + (height - drawn_height) / 2,
        drawn_width,
        drawn_height,
        preserveAspectRatio=True,
        mask="auto" if preserve_alpha else None,
    )


def prepare_pdf_assets():
    """Zmenší rastrové podklady na skutečnou tiskovou velikost v PDF."""
    TEMP_ASSETS.mkdir(parents=True, exist_ok=True)
    sources = {
        "logo": (ROOT / "assets/logo-invictus-2011.webp", (280, 210), "PNG"),
        "havirov": (ROOT / "assets/competitions/futsal-havirov.jpg", (300, 150), "JPEG"),
        "facr": (ROOT / "assets/competitions/facr.png", (150, 150), "PNG"),
        "karvina": (ROOT / "assets/competitions/futsal-karvina.png", (150, 150), "PNG"),
    }
    prepared = {}
    for key, (source, size, image_format) in sources.items():
        suffix = ".jpg" if image_format == "JPEG" else ".png"
        target = TEMP_ASSETS / f"{key}{suffix}"
        with Image.open(source) as image:
            image.thumbnail(size, Image.Resampling.LANCZOS)
            if image_format == "JPEG":
                image.convert("RGB").save(target, image_format, quality=86, optimize=True, progressive=True)
            else:
                image.save(target, image_format, optimize=True)
        prepared[key] = target
    return prepared


def wrap_lines(text, font_name, font_size, max_width):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if not current or pdfmetrics.stringWidth(candidate, font_name, font_size) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_wrapped(c, text, x, y, width, font="Invictus", size=8, leading=11, color=MUTED, max_lines=None):
    lines = wrap_lines(text, font, size, width)
    if max_lines and len(lines) > max_lines:
        lines = lines[:max_lines]
        last = lines[-1]
        while last and pdfmetrics.stringWidth(last + "…", font, size) > width:
            last = last[:-1]
        lines[-1] = last.rstrip() + "…"
    c.setFillColor(color)
    c.setFont(font, size)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def draw_label(c, text, x, y, color=GOLD_LIGHT):
    c.setFillColor(color)
    c.setFont("Invictus-Bold", 6.2)
    c.drawString(x, y, text.upper())


def draw_jersey(c, x, y, width, height, back=False):
    c.saveState()
    c.setStrokeColor(GOLD)
    c.setFillColor(HexColor("#111111"))
    c.setLineWidth(1.15)
    points = [
        (x + width * 0.34, y + height),
        (x + width * 0.18, y + height * 0.91),
        (x, y + height * 0.69),
        (x + width * 0.15, y + height * 0.55),
        (x + width * 0.25, y + height * 0.64),
        (x + width * 0.25, y),
        (x + width * 0.75, y),
        (x + width * 0.75, y + height * 0.64),
        (x + width * 0.85, y + height * 0.55),
        (x + width, y + height * 0.69),
        (x + width * 0.82, y + height * 0.91),
        (x + width * 0.66, y + height),
    ]
    path = c.beginPath()
    path.moveTo(*points[0])
    for point in points[1:]:
        path.lineTo(*point)
    path.close()
    c.drawPath(path, fill=1, stroke=1)

    c.setStrokeColor(Color(1, 1, 1, alpha=0.17))
    c.circle(x + width / 2, y + height * 0.96, width * 0.13, stroke=1, fill=0)

    if back:
        c.setFillColor(Color(0.78, 0.64, 0.30, alpha=0.26))
        c.roundRect(x + width * 0.29, y + height * 0.68, width * 0.42, height * 0.13, 3, fill=1, stroke=0)
        c.setFillColor(GOLD_LIGHT)
        c.setFont("Invictus-Bold", 7)
        c.drawCentredString(x + width / 2, y + height * 0.72, "C")
    else:
        c.setFillColor(Color(0.78, 0.64, 0.30, alpha=0.3))
        c.roundRect(x + width * 0.29, y + height * 0.49, width * 0.42, height * 0.2, 3, fill=1, stroke=0)
        c.setFillColor(GOLD_LIGHT)
        c.setFont("Invictus-Bold", 8)
        c.drawCentredString(x + width / 2, y + height * 0.57, "A")
        c.setFillColor(Color(0.78, 0.64, 0.30, alpha=0.3))
        c.roundRect(x + width * 0.76, y + height * 0.67, width * 0.15, height * 0.12, 2, fill=1, stroke=0)
        c.setFillColor(GOLD_LIGHT)
        c.setFont("Invictus-Bold", 6)
        c.drawCentredString(x + width * 0.835, y + height * 0.71, "B")

    c.setFillColor(Color(0.78, 0.64, 0.30, alpha=0.3))
    c.roundRect(x + width * 0.55, y + height * 0.05, width * 0.17, height * 0.11, 2, fill=1, stroke=0)
    c.setFillColor(GOLD_LIGHT)
    c.setFont("Invictus-Bold", 6)
    c.drawCentredString(x + width * 0.635, y + height * 0.085, "D")
    c.restoreState()


def draw_stat(c, x, y, width, value, label):
    c.setFillColor(GOLD_LIGHT)
    c.setFont("Invictus-Condensed-Bold", 18)
    c.drawString(x, y, value)
    draw_wrapped(c, label.upper(), x, y - 12, width, font="Invictus-Bold", size=5.5, leading=7, color=MUTED, max_lines=2)


def draw_variant(c, x, y, width, height, number, title, text):
    c.setFillColor(PANEL)
    c.roundRect(x, y, width, height, 7, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.roundRect(x + 10, y + height - 24, 25, 14, 7, fill=1, stroke=0)
    c.setFillColor(BLACK)
    c.setFont("Invictus-Bold", 6.5)
    c.drawCentredString(x + 22.5, y + height - 19.2, number)
    c.setFillColor(WHITE)
    c.setFont("Invictus-Condensed-Bold", 9.3)
    c.drawString(x + 43, y + height - 20, title.upper())
    draw_wrapped(c, text, x + 10, y + height - 36, width - 20, font="Invictus", size=6.6, leading=8.6, color=MUTED, max_lines=4)


def build_pdf():
    register_fonts()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    pdf_assets = prepare_pdf_assets()
    page_width, page_height = A4
    c = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    c.setTitle("Partnerský balíček Invictus 2011 - sezona 2026/27")
    c.setAuthor("Invictus 2011")
    c.setSubject("Možnosti partnerství a sponzoringu pro sezonu 2026/27")
    c.setKeywords("Invictus 2011, futsal, partnerství, sponzoring, Havířov")

    c.setFillColor(BLACK)
    c.rect(0, 0, page_width, page_height, fill=1, stroke=0)

    margin = 28
    content_width = page_width - 2 * margin

    # Hlavička
    fit_image(c, pdf_assets["logo"], margin, 749, 70, 58)
    c.setFillColor(GOLD_LIGHT)
    c.setFont("Invictus-Bold", 6.5)
    c.drawString(111, 802, "PARTNERSTVÍ · SEZONA 2026/27")
    c.setFillColor(WHITE)
    c.setFont("Invictus-Condensed-Bold", 21)
    c.drawString(111, 777, "BUĎTE VIDĚT S INVICTEM")
    draw_wrapped(
        c,
        "Hledáme nového partnera pro jubilejní sezonu klubu s patnáctiletou historií.",
        112,
        760,
        335,
        size=7.2,
        leading=9.5,
        color=MUTED,
        max_lines=2,
    )
    c.setFillColor(PANEL_ALT)
    c.roundRect(462, 768, 104, 34, 17, fill=1, stroke=0)
    c.setFillColor(HexColor("#6DDA91"))
    c.circle(477, 785, 3.4, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Invictus-Bold", 6.3)
    c.drawString(487, 782.5, "NABÍDKA OTEVŘENA")
    c.setStrokeColor(GOLD)
    c.setLineWidth(1)
    c.line(margin, 738, page_width - margin, 738)

    # Klubová čísla
    stats_y = 700
    stat_width = content_width / 5
    stats = [
        ("2011", "rok založení klubu"),
        ("15", "let klubové historie"),
        ("16", "hráčů v soupisce"),
        ("2", "soutěže v sezoně 25/26"),
        ("3", "regionální ligy v historii"),
    ]
    for index, (value, label) in enumerate(stats):
        x = margin + stat_width * index
        if index:
            c.setStrokeColor(LINE)
            c.line(x, 686, x, 727)
        draw_stat(c, x + 9, stats_y + 8, stat_width - 17, value, label)

    left_x = margin
    left_w = 254
    gap = 13
    right_x = left_x + left_w + gap
    right_w = content_width - left_w - gap

    # Levý blok - umístění loga
    draw_label(c, "Viditelnost značky", left_x, 662)
    c.setFillColor(WHITE)
    c.setFont("Invictus-Condensed-Bold", 15)
    c.drawString(left_x, 643, "LOGO NA NOVÉ SADĚ DRESŮ")
    c.setFillColor(PANEL)
    c.roundRect(left_x, 432, left_w, 198, 8, fill=1, stroke=0)
    draw_jersey(c, left_x + 29, 477, 78, 126, back=False)
    draw_jersey(c, left_x + 144, 477, 78, 126, back=True)
    c.setFillColor(MUTED)
    c.setFont("Invictus-Bold", 5.7)
    c.drawCentredString(left_x + 68, 462, "PŘEDNÍ STRANA")
    c.drawCentredString(left_x + 183, 462, "ZADNÍ STRANA")

    placements = [
        ("A", "Hruď", "dominantní plocha"),
        ("B", "Rukáv", "doplňkové logo"),
        ("C", "Záda", "horní část"),
        ("D", "Trenýrky", "doplňková plocha"),
    ]
    placement_y = 447
    for index, (code, title, description) in enumerate(placements):
        column = index % 2
        row = index // 2
        x = left_x + 12 + column * 119
        y = placement_y - row * 23
        c.setFillColor(GOLD)
        c.circle(x + 4, y + 3, 4.2, fill=1, stroke=0)
        c.setFillColor(BLACK)
        c.setFont("Invictus-Bold", 5)
        c.drawCentredString(x + 4, y + 1.2, code)
        c.setFillColor(WHITE)
        c.setFont("Invictus-Bold", 6.2)
        c.drawString(x + 13, y + 2, title.upper())
        c.setFillColor(MUTED)
        c.setFont("Invictus", 5.7)
        c.drawString(x + 13, y - 6, description)

    # Digitální dosah
    c.setFillColor(PANEL_ALT)
    c.roundRect(left_x, 294, left_w, 124, 8, fill=1, stroke=0)
    draw_label(c, "Instagram + web", left_x + 13, 399)
    c.setFillColor(WHITE)
    c.setFont("Invictus-Condensed-Bold", 12)
    c.drawString(left_x + 13, 382, "REGIONÁLNÍ FUTSALOVÁ KOMUNITA")
    digital_points = [
        "@futsalinvictus2011 - zápasy, tým, zákulisí a akce",
        "5 nejnovějších příspěvků propojeno s klubovým webem",
        "Dosah, zobrazení a publikum doložíme z Instagram Insights",
    ]
    y = 363
    for point in digital_points:
        c.setFillColor(GOLD)
        c.circle(left_x + 16, y + 2, 2.1, fill=1, stroke=0)
        y = draw_wrapped(c, point, left_x + 24, y, left_w - 37, size=6.4, leading=8.5, color=CREAM, max_lines=2) - 5

    # Soutěže
    draw_label(c, "Klub napříč regionem", left_x, 278)
    c.setFillColor(WHITE)
    c.setFont("Invictus-Condensed-Bold", 11)
    c.drawString(left_x, 261, "HAVÍŘOV · OSTRAVA/OPAVA · KARVINÁ")
    logo_y = 205
    logo_data = [
        (pdf_assets["havirov"], "Havířovská liga"),
        (pdf_assets["facr"], "Ostrava/Opava"),
        (pdf_assets["karvina"], "Karvinská liga"),
    ]
    logo_width = left_w / 3
    for index, (path, label) in enumerate(logo_data):
        x = left_x + index * logo_width
        c.setFillColor(WHITE)
        c.roundRect(x + 2, logo_y, logo_width - 8, 47, 5, fill=1, stroke=0)
        fit_image(c, path, x + 9, logo_y + 7, logo_width - 22, 33, preserve_alpha=True)
        c.setFillColor(MUTED)
        c.setFont("Invictus-Bold", 5.1)
        c.drawCentredString(x + (logo_width - 4) / 2, logo_y - 10, label.upper())

    # Pravý blok - varianty
    draw_label(c, "Konkrétní modely spolupráce", right_x, 662)
    c.setFillColor(WHITE)
    c.setFont("Invictus-Condensed-Bold", 15)
    c.drawString(right_x, 643, "VYBEREME FORMÁT, KTERÝ SEDÍ")
    variants = [
        (
            "01",
            "Generální partner sezony",
            "Dominantní logo na hrudi, přednostní webová a instagramová prezentace a spojení s jubilejní sezonou.",
        ),
        (
            "02",
            "Hlavní partner",
            "Logo na zádech nebo rukávu, partner webu a pravidelné označení ve vybraných klubových výstupech.",
        ),
        (
            "03",
            "Partner klubu",
            "Viditelnost na webu a sociálních sítích, vybrané zápasové materiály a týmové fotografie.",
        ),
        (
            "04",
            "Partner akce / barter",
            "INVI CUP, vybavení, doprava, tisk, občerstvení, služby nebo podpora konkrétní klubové potřeby.",
        ),
    ]
    card_h = 88
    card_gap = 8
    card_y = 542
    for number, title, text in variants:
        draw_variant(c, right_x, card_y, right_w, card_h, number, title, text)
        card_y -= card_h + card_gap

    c.setFillColor(PANEL_ALT)
    c.roundRect(right_x, 205, right_w, 45, 7, fill=1, stroke=0)
    c.setFillColor(GOLD_LIGHT)
    c.setFont("Invictus-Bold", 6.1)
    c.drawString(right_x + 12, 232, "VŠECHNY VARIANTY NASTAVÍME INDIVIDUÁLNĚ")
    draw_wrapped(
        c,
        "Rozsah prezentace, konkrétní plocha i forma podpory se odvíjí od dohody a hodnoty spolupráce.",
        right_x + 12,
        218,
        right_w - 24,
        size=6.1,
        leading=8,
        color=MUTED,
        max_lines=2,
    )

    # Kontaktní CTA
    c.setFillColor(GOLD)
    c.roundRect(margin, 55, content_width, 121, 9, fill=1, stroke=0)
    c.setFillColor(BLACK)
    c.setFont("Invictus-Bold", 6.4)
    c.drawString(margin + 16, 153, "PARTNERSTVÍ 2026/27")
    c.setFont("Invictus-Condensed-Bold", 15.5)
    c.drawString(margin + 16, 129, "POJĎME SPOLEČNĚ OTEVŘÍT")
    c.drawString(margin + 16, 110, "NOVOU SEZONU.")
    draw_wrapped(
        c,
        "Stačí krátký e-mail. Bez závazků představíme možnosti a připravíme spolupráci na míru.",
        margin + 16,
        90,
        330,
        size=7,
        leading=9,
        color=HexColor("#3A2E12"),
        max_lines=1,
    )
    c.setFillColor(BLACK)
    c.roundRect(385, 82, 165, 62, 7, fill=1, stroke=0)
    c.setFillColor(GOLD_LIGHT)
    c.setFont("Invictus-Bold", 5.7)
    c.drawString(398, 130, "KONTAKT")
    c.setFillColor(WHITE)
    c.setFont("Invictus-Bold", 7.1)
    c.drawString(398, 114, "futsalinvictus2011@gmail.com")
    c.setFillColor(MUTED)
    c.setFont("Invictus", 6.1)
    c.drawString(398, 99, "invictus2011.cz  ·  @futsalinvictus2011")
    c.linkURL("mailto:futsalinvictus2011@gmail.com", (398, 108, 545, 121), relative=0)
    c.linkURL("https://invictus2011.cz", (398, 94, 459, 105), relative=0)
    c.linkURL("https://www.instagram.com/futsalinvictus2011/", (468, 94, 545, 105), relative=0)

    c.setFillColor(HexColor("#6E5B2D"))
    c.setFont("Invictus", 5.4)
    c.drawString(margin, 38, "Klubové údaje: stav srpen 2026.")
    c.drawRightString(page_width - margin, 38, "Amicitia · Virtus · Invictus")

    c.showPage()
    c.save()
    print(f"Vytvořeno: {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    build_pdf()
