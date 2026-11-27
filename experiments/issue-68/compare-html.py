#!/usr/bin/env python3
"""Сравнение двух HTML без учёта пробельного форматирования (issue #68: Jekyll → markdown-it).

    python3 -I experiments/issue-68/compare-html.py OLD.html NEW.html

Нормализация: дерево тегов с атрибутами (порядок атрибутов не важен, style без пробелов),
текст со схлопнутыми пробелами. Печатает первые расхождения в виде unified diff.
"""
import difflib
import re
import sys
from html.parser import HTMLParser

VOID = {"meta", "link", "br", "img", "hr", "input"}


class Flat(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.text = [], []

    def flush(self):
        t = re.sub(r"\s+", " ", "".join(self.text)).strip()
        if t:
            self.out.append("  text: " + t)
        self.text = []

    def handle_starttag(self, tag, attrs):
        self.flush()
        norm = sorted((k, re.sub(r"\s+", "", v) if k == "style" and v else v) for k, v in attrs)
        self.out.append(f"<{tag} {norm}>")

    def handle_endtag(self, tag):
        self.flush()
        if tag not in VOID:
            self.out.append(f"</{tag}>")

    def handle_data(self, data):
        self.text.append(data)


def flat(path):
    p = Flat()
    p.feed(open(path, encoding="utf-8").read())
    p.flush()
    return p.out


a, b = flat(sys.argv[1]), flat(sys.argv[2])
diff = list(difflib.unified_diff(a, b, sys.argv[1], sys.argv[2], n=2, lineterm=""))
print("\n".join(diff[:200]) if diff else f"OK: {sys.argv[2]} совпадает с {sys.argv[1]} ({len(a)} узлов)")
sys.exit(1 if diff else 0)
