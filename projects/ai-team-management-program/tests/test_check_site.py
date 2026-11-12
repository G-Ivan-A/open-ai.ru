#!/usr/bin/env python3
"""Регрессионные тесты проверки брошюры: собранная страница проходит проверку,
а каждое намеренное нарушение требований issues #61 и #63 ловится.

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
        self.assertIn("## Почему так", md)
        self.assertIn("## Команда", md)

    def test_brochure_skips_why_section_only(self):
        md = check_site.read_source("content/01-project-summary.md", CANDS)
        self.assertNotIn("## Почему так", md)
        self.assertIn("## Экономика", md)
        self.assertIn("## Команда", md)

    def test_old_hours_abbreviation_pattern(self):
        self.assertIsNotNone(check_site.OLD_HOURS.search("91 а.ч. за 3 месяца"))
        self.assertIsNotNone(check_site.OLD_HOURS.search("А.ч. всего"))
        self.assertIsNone(check_site.OLD_HOURS.search("91 ак.ч. за 3 месяца; Ак.ч. всего"))

    def test_sources_use_academic_hours(self):
        for f in sorted(check_site.CONTENT.glob("*.md")):
            text = f.read_text(encoding="utf-8")
            self.assertIsNone(check_site.OLD_HOURS.search(text), f"{f.name}: «а.ч.» вместо «ак.ч.»")

    def test_summary_economics_for_group_of_25(self):
        md = (check_site.CONTENT / "01-project-summary.md").read_text(encoding="utf-8")
        econ = md.split("## Экономика")[1].split("\n## ")[0]
        self.assertIn("25 × 175 000 ₽ =\n4 375 000 ₽ (4,375 млн ₽)", econ)
        num = lambda s: float(s.replace(" ", "").replace(",", ".").replace("−", "-"))  # noqa: E731

        def row(table: str, title: str) -> str:
            line = next(l for l in table.splitlines() if l.replace("**", "").startswith(f"| {title}"))
            return line.replace("**", "").strip("|").split("|")[1].strip()

        first = econ.split("### Первый запуск (группа 25 человек)")[1].split("###")[0]
        repeat = econ.split("### 2-й и последующие запуски (группа 25 человек)")[1]
        nre, opex = num(row(first, "NRE")), num(row(first, "OPEX — поток 25 участников"))
        self.assertAlmostEqual(num(row(first, "Итого себестоимость первого потока")), nre + opex)
        for table, cost in ((first, nre + opex), (repeat, opex)):
            revenue = num(row(table, "Итого выручка (Цена для заказчика)"))
            self.assertAlmostEqual(revenue, 25 * 175_000 / 1e6)
            margin = num(row(table, "Итого маржинальность").rstrip("%"))
            self.assertEqual(margin, round((revenue - cost) / revenue * 100, 1))
        self.assertAlmostEqual(num(row(repeat, "Итого себестоимость повторного потока")), opex)
        self.assertIn(f"повторный поток — {row(repeat, 'OPEX — поток 25 участников')} млн ₽.", econ)

    def test_detailed_economics_totals(self):
        md = (check_site.CONTENT / "05-detailed-economics.md").read_text(encoding="utf-8")
        num = lambda s: int(s.replace("**", "").replace(" ", "").strip())  # noqa: E731

        def section(title: str) -> list[list[str]]:
            body = md.split(title)[1].split("\n## ")[0]
            return [[c.strip() for c in l.strip("|").split("|")] for l in body.splitlines() if l.startswith("|")][2:]

        def total(rows, label):
            return num(next(r for r in rows if r[0].replace("**", "") == label)[-1])

        nre_rows, opex_rows = section("## 1. NRE"), section("## 2. OPEX")
        nre, opex = total(nre_rows, "Итого NRE"), total(opex_rows, "Итого OPEX потока")
        items = [r for r in opex_rows if not r[0].startswith("**")]
        fot = sum(num(r[-1]) for r in items[:6])
        self.assertEqual(total(opex_rows, "ФОТ gross"), fot)
        self.assertEqual(total(opex_rows, "ФОТ с взносами"), round(fot * 1.3))
        self.assertEqual(opex, round(fot * 1.3) + sum(num(r[-1]) for r in items[6:]))
        self.assertEqual((nre, opex), (2_410_000, 2_220_800))
        cogs = section("## 3. Себестоимость")
        self.assertEqual(total(cogs, "COGS первого потока"), nre + opex)
        self.assertEqual(total(cogs, "COGS повторного потока"), opex)
        price = section("## 4. Цена для заказчика")
        self.assertEqual(total(price, "Поток 25 участников: 25 × 175 000 ₽"), 25 * 175_000)
        margin = section("## 5. Маржинальность")
        for r, cost in zip(margin, (nre + opex, opex)):
            self.assertEqual((num(r[1]), num(r[2])), (cost, 4_375_000))
            pct = float(r[4].replace("**", "").replace("%", "").replace(",", ".").replace("−", "-"))
            self.assertEqual(pct, round((4_375_000 - cost) / 4_375_000 * 100, 1))

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

    def errors(self, html: str | None = None, brochure: str | None = None) -> list[str]:
        if html is not None:
            self.index.write_text(html, encoding="utf-8")
        if brochure is not None:
            self.brochure.write_text(brochure, encoding="utf-8")
        return check_site.run(self.site).errors

    @staticmethod
    def sub(text: str, pattern: str, repl: str, count: int = 1) -> str:
        new, n = re.subn(pattern, repl, text, count=count, flags=re.S)
        assert n > 0, f"шаблон мутации не найден: {pattern}"
        return new

    def mutate(self, pattern: str, repl: str, count: int = 1) -> str:
        return self.sub(self.html, pattern, repl, count)

    def assertCaught(self, fragment: str, html: str | None = None, brochure: str | None = None):
        errs = self.errors(html, brochure)
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
        html = html.replace("</main>", passport + "\n</main>")
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
        errs = check_site.run(self.site, require_pdf=True).errors
        self.assertTrue(any("ссылка на PDF ведёт" in e for e in errs), errs)

    def test_hero_title_is_verbatim(self):
        self.assertCaught("заголовок первого экрана", self.mutate(r"(<h1[^>]*>)«ИИ", r"\1Программа «ИИ"))

    # --- Финальная версия для стейкхолдеров (issue #63) ---

    def test_budget_form_is_caught(self):
        self.assertCaught("не должно быть форм",
                          self.mutate(r"(</main>)", r'<section id="budget"><form action="mailto:"><input name="Имя">'
                                                    r'<button type="submit">Запросить бюджет</button></form></section>\1'))

    def test_budget_script_is_caught(self):
        self.assertCaught("не должно быть скриптов", self.mutate(r"(</head>)", r'<script src="assets/js/budget.js" defer></script>\1'))

    def test_old_hours_on_web_page_is_caught(self):
        self.assertCaught("«а.ч.»", self.mutate(r"ак\.ч\.", "а.ч."))

    def test_old_hours_in_brochure_is_caught(self):
        self.assertCaught("«а.ч.»", brochure=self.sub(self.bhtml, r"ак\.ч\.", "а.ч."))

    def test_why_section_in_brochure_is_caught(self):
        self.assertCaught("«Почему так»",
                          brochure=self.sub(self.bhtml, r'(<h2 id="команда">)', r"<h2>Почему так</h2>\1"))

    def test_external_link_without_target_is_caught(self):
        self.assertCaught('target="_blank"', self.mutate(r'<a target="_blank" rel="noopener noreferrer" href="http', '<a href="http'))

    def test_external_link_without_noreferrer_is_caught(self):
        self.assertCaught("noopener noreferrer",
                          brochure=self.sub(self.bhtml, r'rel="noopener noreferrer"', 'rel="noopener"'))

    def test_edit_history_is_caught(self):
        self.assertCaught("исправлено", self.mutate(r"(</footer>)", r"<p>Исправлено: цена</p>\1"))
        self.assertCaught("версия N", brochure=self.sub(self.bhtml, r"(</body>)", r"<p>Версия 2</p>\1"))

    # --- Регресс и правила контента ---

    def test_portal_text_is_caught(self):
        self.assertCaught("прежнего портала", self.mutate(r"(</footer>)", r"<p>open-ai.ru</p>\1"))

    def test_hidden_candidate_name_is_caught(self):
        self.assertCaught("без согласия", self.mutate(r"(<p><strong>Куратор)", rf"<p>{CANDS[0]['name']}</p>\1"))

    def test_price_on_web_page_is_caught(self):
        self.assertCaught("коммерческие данные", self.mutate(r"(<h2 class=\"doc__part-title\">Бизнес-цель</h2>)",
                                                             r"\1<p>Цена: 6,90 млн ₽</p>"))

    def test_old_portal_file_is_caught(self):
        (self.site / "assets" / "js").mkdir(parents=True, exist_ok=True)
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
