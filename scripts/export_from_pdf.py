"""Export project images from the portfolio PDF into src/assets/<id>/.

Usage (needs Python with pymupdf and pillow: pip install pymupdf pillow):
    python scripts/export_from_pdf.py path/to/MalinNeamtzu-Portofolio-2026-25mb.pdf

`cover` is the internal number (xref) of an image embedded in the PDF, saved
at its original size. `slides` are page numbers rendered as whole slides at
2400px wide; they become the gallery. Running it again overwrites the files.
"""
import os
import sys

import pymupdf
from PIL import Image

PROJECTS = {
    "segmentor":       dict(cover=576,  slides=[32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 96, 97, 98, 99, 100, 101]),
    "oyo9":            dict(cover=1017, slides=[52, 53, 54]),
    "club-guesthouse": dict(cover=1213, slides=[55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66]),
    "records":         dict(cover=667,  slides=[42, 43, 44, 45, 46, 47]),
    "palms-cocos":     dict(cover=747,  slides=[48, 49, 50, 51]),
    "spy-master":      dict(cover_slide=26, slides=[23, 24, 25, 26, 27, 28, 29, 30, 31]),
    "henkan-grotesk":  dict(cover=80,   slides=[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 78, 79, 80]),
    "formatype":       dict(cover=364,  slides=[14, 15, 16, 17, 18, 19, 20, 21, 22]),
    "clazic":          dict(cover=1350, slides=[68, 69]),
    "skuba":           dict(cover=1370, slides=[70, 71, 72, 73]),
    "rzr":             dict(cover=1415, slides=[74, 75]),
    "cocoscript":      dict(cover=1430, slides=[76, 77]),
    "lubke":           dict(cover=1457, slides=[81, 82]),
    "poschta":         dict(cover=1473, slides=[83, 84, 85, 86]),
    "noodle":          dict(cover=1507, slides=[87, 88]),
    "hecvba":          dict(cover=1520, slides=[89, 90]),
    "kenjo":           dict(cover=1531, slides=[91, 92, 93, 94, 95]),
}

def main(pdf_path, assets="src/assets"):
    doc = pymupdf.open(pdf_path)

    def save_embedded(xref, path):
        pix = pymupdf.Pixmap(doc, xref)
        if pix.n - pix.alpha >= 4:
            pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
        if pix.alpha:
            pix = pymupdf.Pixmap(pix, 0)
        Image.frombytes("RGB", (pix.width, pix.height), pix.samples).save(path, quality=90)

    def save_slide(page_no, path, width=2400):
        zoom = width / doc[page_no - 1].rect.width
        doc[page_no - 1].get_pixmap(matrix=pymupdf.Matrix(zoom, zoom)).pil_save(path, quality=88)

    for pid, spec in PROJECTS.items():
        folder = os.path.join(assets, pid)
        os.makedirs(folder, exist_ok=True)
        if "cover" in spec:
            save_embedded(spec["cover"], os.path.join(folder, "cover.jpg"))
        else:
            save_slide(spec["cover_slide"], os.path.join(folder, "cover.jpg"), 1600)
        for i, page_no in enumerate(spec["slides"], 1):
            save_slide(page_no, os.path.join(folder, f"{pid}-{i:02}.jpg"))
        print(pid, len(spec["slides"]), "slides")

if __name__ == "__main__":
    main(sys.argv[1])
