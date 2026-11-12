#!/usr/bin/env python3
"""Регрессионные тесты проверки брошюры: собранная страница проходит проверку,
а каждое намеренное нарушение требований issue #61 ловится.

    SITE_DIR=../../_site/projects/ai-team-management-program python3 -m unittest tests/test_check_site.py -v

Нужен собранный сайт (SITE_DIR, по умолчанию <корень репозитория>/_site/projects/ai-team-management-program).
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

SITE = Path(os.environ.get("SITE_DIR", check_site.REPO / "_site" / "projects" / "ai-team-management-program")).resolve()
CANDS = check_site.candidates()


class MarkdownHelpers(unittest.TestCase):
    def test_blocks_keep_kinds_and_strip_inline_markup(self):
        md = "# Заголовок\n\nАбзац **жирный** и [ссылка](https://example.org)\nпродолжение\n\n" \
             "| A | B |\n| --- | --- |\n| 1 | x |\n\n- **Один.** первая\n  строка\n- Второй\n\n### Подраздел\n"
        self.assertEqual(check_site.md_blocks(md), [
            ("h1", "Заголовок"),
            ("p", "Абзац жирный и ссылка продолжение"),
            ("td", "A"), ("td", "B"), ("td", "1"), ("td", "x"),
            ("li", "Один. первая строка"), ("li", "Второй"),
            ("h3", "Подраздел"),
        ])

    def test_consent_filter_hides_candidates_without_consent(self):
        md = "## [4]\n\nВедущий эксперт 1: Иванов И. | факт\n\n**Куратор — штатная роль.**\n\n" \
             "**Метка GRA:** ● — легенда\n\n**Источники:** Иванов И. — [сайт](https://example.org)"
        cands = [{"slot": "Ведущий эксперт 1", "name": "Иванов И.", "consent": False}]
        self.assertEqual(check_site.consent_filter(md, cands), "## [4]\n\n**Куратор — штатная роль.**")
        cands[0]["consent"] = True
        self.assertEqual(check_site.consent_filter(md, cands), md)

    def test_all_candidates_are_unpublished_by_default(self):
        self.assertTrue(CANDS)
        self.assertTrue(all(not c["consent"] for c in CANDS))

    def test_web_page_skips_economics_only(self):
        md = check_site.read_source("content/01-project-summary.md", CANDS, web=True)
        self.assertNotIn("## Экономика", md)
        self.assertIn("## Команда", md)

    def test_passport_has_12_weeks_and_91_hours(self):
        passport = (check_site.CONTENT / "02-project-passport.md").read_text(encoding="utf-8")
        table = passport.split("### Модульная структура")[1].split("\n\n")[1]
        rows = [l.strip("|").split("|") for l in table.splitlines()[2:]]
        self.assertEqual([r[0].strip() for r in rows], [str(n) for n in range(12)])
        self.assertEqual(sum(int(r[2]) for r in rows), 91)


@unittest.skipUnless((SITE / "index.html").is_file(), f"нет собранного сайта в {SITE}")
class BuiltSite(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.site = self.tmp / "site"
        shutil.copytree(SITE, self.site)
        self.index = self.site / "index.html"
        self.brochure = self.site / "brochure.html"
        self.html = self.index.read_text(encoding="utf-8")
        self.bhtml = self.brochure.read_text(encoding="utf-8")

    def tearDown(self):
        shutil.rmtree(self.tmp)

    def errors(self, html: str | None = None, brochure: str | None = None, allow_missing_email: bool = True) -> list[str]:
        if html is not None:
            self.index.write_text(html, encoding="utf-8")
        if brochure is not None:
            self.brochure.write_text(brochure, encoding="utf-8")
        return check_site.run(self.site, allow_missing_email).errors

    @staticmethod
    def sub(text: str, pattern: str, repl: str, count: int = 1) -> str:
        new, n = re.subn(pattern, repl, text, count=count, flags=re.S)
        assert n > 0, f"шаблон мутации не найден: {pattern}"
        return new

    def mutate(self, pattern: str, repl: str, count: int = 1) -> str:
        return self.sub(self.html, pattern, repl, count)

    def assertCaught(self, fragment: str, html: str | None = None, brochure: str | None = None, **kw):
        errs = self.errors(html, brochure, **kw)
        self.assertTrue(any(fragment in e for e in errs), f"ожидалась ошибка с «{fragment}», получено: {errs}")

    def test_built_site_passes(self):
        self.assertEqual(self.errors(), [])

    # --- Дословность (Verbatim Rule) ---

    def test_rephrased_word_is_caught(self):
        self.assertCaught("не совпадает дословно", self.mutate("снижение издержек", "сокращение издержек"))

    def test_marketing_text_is_caught(self):
        self.assertCaught("не совпадает дословно",
                          self.mutate(r'(<section class="doc doc--page" id="summary"[^>]*>)',
                                      r"\1<p>Уникальная программа — лучшая на рынке!</p>"))

    def test_text_outside_blocks_is_caught(self):
        self.assertCaught("текст вне заголовков", self.mutate(r'(<div class="doc__body">)', r"\1Только сегодня"))

    def test_missing_table_row_is_caught(self):
        self.assertCaught("отсутствует", self.mutate(r"<tr>\s*<td>KPI 2</td>.*?</tr>", ""))

    def test_reordered_sections_are_caught(self):
        passport = re.search(r'<section class="doc doc--section" id="passport".*?</section>', self.html, re.S).group(0)
        html = self.html.replace(passport, "")
        html = html.replace('<section class="section section--budget"', passport + '\n<section class="section section--budget"')
        self.assertCaught("разделы страницы", html)

    def test_heading_level_is_checked(self):
        self.assertCaught("заголовки и их уровни",
                          self.mutate(r'<h3 class="doc__part-title">(Уровень 1\. Стратегический)</h3>', r"<p>\1</p>"))

    # --- Первый экран и ссылка на PDF ---

    def test_pdf_link_text_is_exact(self):
        self.assertCaught("текст ссылки на PDF", self.mutate("📥 Скачать PDF-брошюру программы", "Скачать PDF"))

    def test_pdf_link_needs_download(self):
        self.assertCaught("download", self.mutate(r'(href="brochure\.pdf") download', r"\1"))

    def test_pdf_link_href(self):
        self.assertCaught("href ссылки на PDF", self.mutate(r'href="brochure\.pdf"', 'href="/projects/ai-team-management-program/brochure.pdf"'))

    def test_pdf_link_target_must_exist_when_required(self):
        (self.site / "brochure.pdf").unlink(missing_ok=True)
        errs = check_site.run(self.site, True, require_pdf=True).errors
        self.assertTrue(any("ссылка на PDF ведёт" in e for e in errs), errs)

    def test_hero_title_is_verbatim(self):
        self.assertCaught("заголовок первого экрана", self.mutate(r"(<h1[^>]*>)«ИИ", r"\1Программа «ИИ"))

    # --- Форма «Запросить бюджет» ---

    def test_checkbox_is_caught(self):
        self.assertCaught("флажков", self.mutate(r"(<button type=\"submit\")",
                                                 r'<input type="checkbox" id="agree" required>\1'))

    def test_extra_field_is_caught(self):
        self.assertCaught("поля формы", self.mutate(r'(<div class="field">\s*<label for="budget-group">)',
                                                    r'<div class="field"><label for="budget-phone">Имя</label>'
                                                    r'<input id="budget-phone" type="tel" required></div>\1'))

    def test_missing_field_is_caught(self):
        self.assertCaught("поля формы", self.mutate(r'<div class="field">\s*<label for="budget-position">.*?</div>', ""))

    def test_group_size_options(self):
        self.assertCaught("размер группы", self.mutate(r'<option value="25">25</option>',
                                                       '<option value="25">25</option><option value="30">30</option>'))

    def test_disabled_button_is_caught(self):
        self.assertCaught("отключена", self.mutate(r'<button type="submit" class="button"', '<button type="submit" class="button" disabled'))

    def test_empty_email_fails_without_flag(self):
        self.assertCaught("budget_email", allow_missing_email=False)

    # --- Регресс и правила контента ---

    def test_portal_text_is_caught(self):
        self.assertCaught("прежнего портала", self.mutate(r"(</footer>)", r"<p>open-ai.ru</p>\1"))

    def test_hidden_candidate_name_is_caught(self):
        self.assertCaught("без согласия", self.mutate(r"(<p><strong>Куратор)", rf"<p>{CANDS[0]['name']}</p>\1"))

    def test_price_on_web_page_is_caught(self):
        self.assertCaught("коммерческие данные", self.mutate(r"(<h2 class=\"doc__part-title\">Бизнес-цель</h2>)",
                                                             r"\1<p>Цена: 6,90 млн ₽</p>"))

    def test_old_portal_file_is_caught(self):
        (self.site / "assets" / "js" / "timeline.js").write_text("//", encoding="utf-8")
        self.assertCaught("лишний файл")

    def test_published_markdown_is_caught(self):
        (self.site / "content").mkdir()
        (self.site / "content" / "01-project-summary.md").write_text("#", encoding="utf-8")
        self.assertCaught("лишний файл")

    # --- brochure.html (источник PDF) ---

    def test_brochure_order_is_strict(self):
        b = self.bhtml
        a05 = re.search(r'<article class="brochure-doc" id="doc-05".*?</article>', b, re.S).group(0)
        a03 = re.search(r'<article class="brochure-doc" id="doc-03".*?</article>', b, re.S).group(0)
        self.assertCaught("ожидается строго", brochure=b.replace(a05, "@@05@@").replace(a03, a05).replace("@@05@@", a03))

    def test_brochure_heading_levels_are_kept(self):
        self.assertCaught("заголовки H1–H6",
                          brochure=self.sub(self.bhtml, r"<h2 ([^>]*)>Условия расчёта</h2>", r"<h3 \1>Условия расчёта</h3>"))

    def test_brochure_text_is_verbatim(self):
        self.assertCaught("brochure.html", brochure=self.sub(self.bhtml, "Все суммы без НДС", "Все суммы указаны без НДС"))

    def test_brochure_missing_table_is_caught(self):
        self.assertCaught("число таблиц", brochure=self.sub(self.bhtml, r'(id="doc-05".*?)<table>.*?</table>', r"\1"))


if __name__ == "__main__":
    unittest.main()
