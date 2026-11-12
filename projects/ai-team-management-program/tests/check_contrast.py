#!/usr/bin/env python3
"""Проверка контраста палитры assets/css/site.css по WCAG 2.1 (уровень AA).

    python3 tests/check_contrast.py

Текст — не ниже 4,5:1; крупные элементы интерфейса и границы полей — не ниже 3:1.
Цвета берутся из переменных :root в site.css, пары — те, что используются в стилях.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

CSS = Path(__file__).resolve().parent.parent / "assets" / "css" / "site.css"

TEXT = 4.5
UI = 3.0

# (цвет текста/элемента, фон, порог, где используется)
PAIRS = [
    ("--ink", "--bg", TEXT, "основной текст"),
    ("--ink", "--tint", TEXT, "текст первого экрана, шапки таблиц, раскрытые разделы"),
    ("--muted", "--bg", TEXT, "меню, подзаголовки, подвал"),
    ("--muted", "--tint", TEXT, "подзаголовок первого экрана"),
    ("--link", "--bg", TEXT, "ссылки на источники"),
    ("--link", "--tint", TEXT, "ссылки в шапках таблиц и первом экране"),
    ("--on-navy", "--navy", TEXT, "кнопки «Скачать PDF-брошюру» и «Запросить бюджет»"),
    ("--line-strong", "--bg", UI, "граница полей формы"),
    ("--navy", "--tint", UI, "кнопка PDF на фоне первого экрана"),
    ("--navy", "--bg", UI, "кнопка формы, линия под заголовком раздела"),
    ("--focus", "--bg", UI, "рамка фокуса"),
    ("--focus", "--tint", UI, "рамка фокуса на тонированном фоне"),
]


def variables(css: str) -> dict[str, str]:
    root = re.search(r":root\s*\{(.*?)\}", css, re.S).group(1)
    return dict(re.findall(r"(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;", root))


def luminance(hex_color: str) -> float:
    rgb = [int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def ratio(a: str, b: str) -> float:
    la, lb = sorted((luminance(a), luminance(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def main() -> int:
    v = variables(CSS.read_text(encoding="utf-8"))
    resolve = lambda c: c if c.startswith("#") else v[c]  # noqa: E731
    failed = 0
    for fg, bg, need, where in PAIRS:
        r = ratio(resolve(fg), resolve(bg))
        ok = r >= need
        failed += not ok
        print(f"{'✓' if ok else '✗'} {r:5.2f}:1 (нужно ≥ {need}) {fg} на {bg} — {where}")
    if failed:
        print(f"Контраст: {failed} пар ниже порога WCAG AA", file=sys.stderr)
        return 1
    print(f"Контраст WCAG AA: все {len(PAIRS)} пар проходят.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
