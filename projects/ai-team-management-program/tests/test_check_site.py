#!/usr/bin/env python3
"""Регрессионные тесты проверки сайта: собранная страница проходит проверку,
а каждое намеренное нарушение требований ловится.

    SITE_DIR=../../_site python3 -m unittest tests/test_check_site.py -v

Нужен собранный сайт (SITE_DIR, по умолчанию <корень репозитория>/_site).
"""

from __future__ import annotations

import os
import re
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import check_site  # noqa: E402

SITE = Path(os.environ.get("SITE_DIR", check_site.PROJECT.parent.parent / "_site")).resolve()


class MarkdownHelpers(unittest.TestCase):
    def test_table_skips_header_and_separator(self):
        md = "| A | B |\n| --- | --- |\n| 1 | x  y |\n"
        self.assertEqual(check_site.md_table(md), [["1", "x y"]])

    def test_bullets_join_wrapped_lines(self):
        md = "- **Один.** первая\n  строка\n- Второй пункт\n"
        self.assertEqual(check_site.md_bullets(md), ["Один. первая строка", "Второй пункт"])

    def test_section_stops_at_same_level(self):
        md = "## A\ntext\n### A1\nsub\n## B\nother\n"
        self.assertEqual(check_site.md_section(md, "A").strip(), "text\n### A1\nsub")

    def test_passport_has_12_weeks_and_91_hours(self):
        passport = (check_site.CONTENT / "02-project-passport.md").read_text(encoding="utf-8")
        rows = check_site.md_table(check_site.md_section(passport, "Модульная структура"))
        self.assertEqual([r[0] for r in rows], [str(n) for n in range(12)])
        self.assertEqual(sum(int(r[2]) for r in rows), 91)


@unittest.skipUnless((SITE / "index.html").is_file(), f"нет собранного сайта в {SITE}")
class BuiltSite(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.site = self.tmp / "_site"
        shutil.copytree(SITE, self.site)
        self.index = self.site / "index.html"
        self.html = self.index.read_text(encoding="utf-8")

    def tearDown(self):
        shutil.rmtree(self.tmp)

    def errors(self, html: str | None = None, allow_missing_email: bool = True) -> list[str]:
        if html is not None:
            self.index.write_text(html, encoding="utf-8")
        return check_site.run(self.site, allow_missing_email).errors

    def mutate(self, pattern: str, repl: str, count: int = 1) -> str:
        new, n = re.subn(pattern, repl, self.html, count=count, flags=re.S)
        self.assertGreater(n, 0, f"шаблон мутации не найден: {pattern}")
        return new

    def assertCaught(self, html: str, fragment: str):
        errs = self.errors(html)
        self.assertTrue(any(fragment in e for e in errs), f"ожидалась ошибка с «{fragment}», получено: {errs}")

    def test_built_site_passes(self):
        self.assertEqual(self.errors(), [])

    def test_missing_week_is_caught(self):
        self.assertCaught(self.mutate(r'<li class="week week--online" id="week-9".*?</li>\s*(?=<li class="week)', ""), "недель 11")

    def test_hours_change_is_caught(self):
        self.assertCaught(self.mutate(r'(id="week-0" data-week="0" data-mode="online" data-hours=")3"', r'\g<1>4"'), "сумма а.ч.")

    def test_offline_highlight_is_required(self):
        self.assertCaught(self.mutate(r'class="week week--offline" id="week-6"', 'class="week" id="week-6"'), "week--offline")

    def test_topics_must_be_verbatim(self):
        self.assertCaught(self.mutate(r"Орг-сессия", "Сессия"), "темы не совпадают")

    def test_hidden_candidate_name_is_caught(self):
        self.assertCaught(self.mutate(r'(data-consent="false">)', r'\1<p>Викулин В.</p>'), "Викулин")

    def test_price_is_caught(self):
        self.assertCaught(self.mutate(r"(<h2 class=\"section__title\" id=\"budget-title\">)", r"\1 3,50 млн ₽ "), "коммерческие данные")

    def test_other_vendor_is_caught(self):
        self.assertCaught(self.mutate(r"(Модели в контуре компании или российские модели)", r"\1 (GigaChat)"), "GigaChat")

    def test_meta_word_is_caught(self):
        self.assertCaught(self.mutate(r"(<footer)", r"<p>Draft</p>\1"), "draft")

    def test_group_size_outside_range_is_caught(self):
        self.assertCaught(self.mutate(r'(<option value="25">25</option>)', r'\1<option value="26">26</option>'), "строго 20–25")
        self.assertCaught(self.mutate(r"для группы 20–25 человек", "для группы 15–30 человек"), "15–30")

    def test_missing_form_field_is_caught(self):
        self.assertCaught(self.mutate(r'<input id="budget-position"[^>]*>', ""), "поля формы")

    def test_zone_text_is_verbatim(self):
        self.assertCaught(self.mutate(r"Персональные данные, коммерческая и банковская тайна", "Персональные данные"), "Светофор данных")

    def test_foreign_link_in_evidence_is_caught(self):
        self.assertCaught(self.mutate(r'(id="evidence-title">)', r'\1<a href="https://example.com/x">x</a>'), "example.com")

    def test_img_without_alt_is_caught(self):
        self.assertCaught(self.mutate(r'(width="28" height="28") alt=""', r"\1"), "alt")

    def test_empty_email_fails_on_main(self):
        if 'data-email=""' not in self.html:
            self.skipTest("budget_email заполнен")
        errs = self.errors(allow_missing_email=False)
        self.assertTrue(any("budget_email" in e for e in errs), errs)

    def test_published_markdown_is_caught(self):
        (self.site / "content").mkdir()
        (self.site / "content" / "01-project-summary.md").write_text("x", encoding="utf-8")
        self.assertTrue(any("служебный файл" in e for e in self.errors()))


if __name__ == "__main__":
    unittest.main()
