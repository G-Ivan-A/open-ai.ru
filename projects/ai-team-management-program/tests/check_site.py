#!/usr/bin/env python3
"""Проверка собранного сайта против источников истины (content/*.md).

Запуск (после сборки Jekyll):

    python3 tests/check_site.py --site ../../_site
    python3 tests/check_site.py --site ../../_site --allow-missing-email   # локально / в PR

Только стандартная библиотека Python 3. Код возврата 0 — проверки пройдены,
1 — найдены расхождения (список печатается), 2 — неверные аргументы или нет файлов.
"""

from __future__ import annotations

import argparse
import html
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
CONTENT = PROJECT / "content"

SECTION_ORDER = ["top", "outcomes", "zones", "timeline", "evidence", "evaluation", "team", "budget"]
OFFLINE_WEEKS = {1, 6, 11}
FORM_FIELDS = ["Имя", "Компания", "Должность", "E-mail", "Размер группы"]

# Экономика и коммерческие условия на сайте не публикуются.
FORBIDDEN_MONEY = [
    (r"₽", "знак рубля"),
    (r"\bруб(?:\.|лей|ля|ль)?\b", "рубли"),
    (r"\bмлн\b", "млн (суммы)"),
    (r"\bтыс\.\s*₽", "тыс. ₽"),
    (r"\bNRE\b", "NRE"),
    (r"\bOPEX\b", "OPEX"),
    (r"себестоим", "себестоимость"),
    (r"\bмарж", "маржа"),
    (r"\bставк", "ставки"),
    (r"\bНДС\b", "НДС"),
    (r"\bФОТ\b", "ФОТ"),
    (r"\bцен[аеуыо]й?\b", "цена"),
    (r"\bгонорар", "гонорар"),
]

# Называется только JustAI; остальные — «российские модели», «модели в контуре компании».
FORBIDDEN_VENDORS = [
    "GigaChat", "ГигаЧат", "YandexGPT", "Yandex", "Яндекс", "Сбер", "Sber", "OpenAI", "ChatGPT",
    r"\bGPT", "Claude", "Anthropic", "Gemini", "Google", "Llama", "Mistral", "DeepSeek", "Qwen",
    "Kandinsky", "Алиса", "Microsoft", "Copilot", "MTS AI", "МТС",
]

# Служебные слова, которых не должно быть в публичных файлах.
FORBIDDEN_META = [
    (r"\bdraft\b", "draft"),
    (r"\bversion\b", "version"),
    (r"\bissue\s*#", "issue #"),
    (r"черновик", "черновик"),
]

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}


# ---------------------------------------------------------------- HTML -----

class Node:
    def __init__(self, tag: str, attrs: dict[str, str | None], parent: "Node | None"):
        self.tag = tag
        self.attrs = attrs
        self.parent = parent
        self.children: list["Node | str"] = []

    def text(self) -> str:
        parts: list[str] = []
        for c in self.children:
            if isinstance(c, str):
                parts.append(c)
            elif c.tag == "br":
                parts.append(" ")
            elif c.tag not in ("script", "style"):
                parts.append(c.text())
        return "".join(parts)

    def iter(self):
        for c in self.children:
            if isinstance(c, Node):
                yield c
                yield from c.iter()

    def find_all(self, tag: str | None = None, **attrs: str | bool) -> list["Node"]:
        out = []
        for n in self.iter():
            if tag and n.tag != tag:
                continue
            ok = True
            for k, v in attrs.items():
                k = k.replace("_", "-")
                if v is True:
                    ok = k in n.attrs
                else:
                    ok = n.attrs.get(k) == v
                if not ok:
                    break
            if ok:
                out.append(n)
        return out

    def find(self, tag: str | None = None, **attrs: str | bool) -> "Node | None":
        found = self.find_all(tag, **attrs)
        return found[0] if found else None

    def has_class(self, name: str) -> bool:
        return name in (self.attrs.get("class") or "").split()


class TreeBuilder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("#root", {}, None)
        self.cur = self.root

    def handle_starttag(self, tag, attrs):
        node = Node(tag, dict(attrs), self.cur)
        self.cur.children.append(node)
        if tag not in VOID:
            self.cur = node

    def handle_startendtag(self, tag, attrs):
        self.cur.children.append(Node(tag, dict(attrs), self.cur))

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        n = self.cur
        while n is not None and n.tag != tag:
            n = n.parent
        if n is not None and n.parent is not None:
            self.cur = n.parent

    def handle_data(self, data):
        self.cur.children.append(data)


def parse_html(source: str) -> Node:
    b = TreeBuilder()
    b.feed(source)
    b.close()
    return b.root


def norm(s: str) -> str:
    """Нормализует пробелы и типографские мелочи для дословного сравнения."""
    s = html.unescape(s).replace(" ", " ")
    s = re.sub(r"\*\*|`", "", s)
    return re.sub(r"\s+", " ", s).strip()


# ------------------------------------------------------------ Markdown -----

def md_section(text: str, heading: str) -> str:
    """Текст раздела Markdown от заголовка, начинающегося с heading, до заголовка того же уровня."""
    lines = text.splitlines()
    for i, line in enumerate(lines):
        m = re.match(r"^(#+)\s+(.*)$", line)
        if m and m.group(2).startswith(heading):
            level = len(m.group(1))
            body = []
            for nxt in lines[i + 1:]:
                m2 = re.match(r"^(#+)\s", nxt)
                if m2 and len(m2.group(1)) <= level:
                    break
                body.append(nxt)
            return "\n".join(body)
    raise LookupError(f"раздел «{heading}» не найден")


def md_table(section: str) -> list[list[str]]:
    rows = []
    for line in section.splitlines():
        if line.startswith("|") and not re.match(r"^\|\s*-", line):
            rows.append([norm(c) for c in line.strip().strip("|").split("|")])
    return rows[1:]  # без заголовка


def md_bullets(section: str) -> list[str]:
    items: list[str] = []
    for line in section.splitlines():
        if line.startswith("- "):
            items.append(line[2:])
        elif line.startswith("  ") and items:
            items[-1] += " " + line.strip()
        elif not line.strip() and items and not items[-1].endswith("\n"):
            continue
    return [norm(i) for i in items]


def md_paragraph(section: str) -> str:
    return norm(" ".join(l for l in section.strip().split("\n\n")[0].splitlines()))


def md_urls(section: str) -> set[str]:
    return set(re.findall(r"\]\((https?://[^)\s]+)\)", section))


# -------------------------------------------------------------- checks -----

class Report:
    def __init__(self):
        self.errors: list[str] = []
        self.passed = 0

    def check(self, ok: bool, message: str):
        if ok:
            self.passed += 1
        else:
            self.errors.append(message)


def check_structure(doc: Node, r: Report):
    root = doc.find("html")
    r.check(root is not None and root.attrs.get("lang") == "ru", "у <html> должен быть lang=\"ru\"")
    ids = [n.attrs.get("id") for n in doc.find_all("section")]
    r.check(ids == SECTION_ORDER, f"порядок разделов {ids}, ожидается {SECTION_ORDER}")
    for img in doc.find_all("img"):
        r.check("alt" in img.attrs, f"у <img src={img.attrs.get('src')}> нет атрибута alt")
    vp = doc.find("meta", name="viewport")
    r.check(vp is not None and "width=device-width" in (vp.attrs.get("content") or ""), "нет meta viewport")
    for sid in SECTION_ORDER:
        sec = doc.find("section", id=sid)
        if sec is not None:
            r.check(bool(sec.find_all("h1") or sec.find_all("h2")), f"в разделе #{sid} нет заголовка")
    r.check(len(doc.find_all("h1")) == 1, "на странице должен быть ровно один <h1>")


def check_hero(doc: Node, summary: str, total: int, r: Report):
    hero = doc.find("section", id="top")
    text = norm(hero.text()) if hero else ""
    goal = md_paragraph(md_section(summary, "Бизнес-цель"))
    r.check(goal in text, "лендинг-хук: бизнес-цель не совпадает дословно с 01 «Бизнес-цель»")
    title = re.match(r"^#\s+(.*)$", summary, re.M).group(1)
    headline = norm(title.split(":", 1)[1])
    h1 = hero.find("h1") if hero else None
    r.check(h1 is not None and norm(h1.text()) == headline, f"лендинг-хук: h1 должен быть «{headline}»")
    counters = {n.attrs["data-counter"]: norm(n.text()) for n in (hero.find_all(data_counter=True) if hero else [])}
    r.check(list(counters) == ["hours", "offline", "practice", "prototype"], f"счётчики: {list(counters)}")
    r.check(counters.get("hours", "").startswith(f"{total} а.ч."), f"счётчик часов: «{counters.get('hours')}», ожидается {total} а.ч.")
    r.check(counters.get("offline", "").startswith("3 "), "счётчик очных блоков должен быть 3")
    r.check(counters.get("practice", "").startswith("80 %") or counters.get("practice", "").startswith("80%"), "счётчик практики должен быть 80%")
    r.check(counters.get("prototype", "").startswith("80 %") or counters.get("prototype", "").startswith("80%"), "счётчик прототипов должен быть 80%")
    buttons = [norm(a.text()) for a in hero.find_all("a")] if hero else []
    r.check("Запросить детальный бюджет" in buttons, "лендинг-хук: нет кнопки «Запросить детальный бюджет»")


def check_outcomes(doc: Node, summary: str, r: Report):
    sec = doc.find("section", id="outcomes")
    cards = [c for c in (sec.iter() if sec else []) if c.tag == "li" and c.has_class("card")]
    r.check(len(cards) == 4, f"«Что получает руководитель»: карточек {len(cards)}, ожидается 4")
    text = norm(sec.text()) if sec else ""
    for item in md_bullets(md_section(summary, "Что получает руководитель")):
        r.check(item in text, f"«Что получает руководитель»: нет дословного пункта «{item[:60]}…»")
    weeks = {n.attrs.get("id") for n in doc.find_all("li", data_week=True)}
    for a in (sec.find_all("a", data_week_link=True) if sec else []):
        r.check(a.attrs.get("href", "")[1:] in weeks, f"ссылка {a.attrs.get('href')} ведёт на несуществующую неделю")


def check_zones(doc: Node, passport: str, r: Report):
    sec = doc.find("section", id="zones")
    rows = sec.find_all("tr", data_zone_row=True) if sec else []
    expected = md_table(md_section(passport, "Уровень 2"))
    expected = [row for row in expected if row[0] in ("Зелёная", "Жёлтая", "Красная")]
    r.check(len(rows) == 3 and len(expected) == 3, "«Светофор данных»: ожидается 3 зоны")
    for row, exp in zip(rows, expected):
        cells = [norm(c.text()) for c in row.iter() if c.tag in ("th", "td")]
        r.check(cells == exp, f"«Светофор данных»: строка {cells} не совпадает с 02: {exp}")
    switch = sec.find(data_zones_switch=True) if sec else None
    buttons = switch.find_all("button", data_zone=True) if switch else []
    ids = [b.attrs.get("data-zone") for b in buttons]
    r.check(ids[:3] == ["green", "yellow", "red"], f"переключатель зон: кнопки {ids}")
    r.check(all("aria-pressed" in b.attrs for b in buttons), "кнопки переключателя зон должны иметь aria-pressed")


def check_timeline(doc: Node, passport: str, r: Report) -> int:
    section = md_section(passport, "Модульная структура")
    expected = md_table(section)
    m = re.search(r"Итого:\s*(\d+)\s*а\.ч\.", section)
    passport_total = int(m.group(1)) if m else -1
    weeks = doc.find_all("li", data_week=True)
    r.check(len(weeks) == 12, f"таймлайн: недель {len(weeks)}, ожидается 12")
    r.check(len(expected) == 12, f"паспорт: недель в таблице {len(expected)}, ожидается 12")
    nums = [int(w.attrs["data-week"]) for w in weeks]
    r.check(nums == list(range(12)), f"таймлайн: недели {nums}, ожидается 0–11 по порядку")
    total = 0
    offline = set()
    for w, exp in zip(weeks, expected):
        n = int(w.attrs["data-week"])
        week_no, fmt, hours, lead, topics, result = exp
        fields = {f.attrs["data-field"]: norm(f.text()) for f in w.find_all(data_field=True)}
        r.check(str(n) == week_no, f"неделя {n}: в паспорте на этом месте неделя {week_no}")
        r.check(fields.get("format") == fmt, f"неделя {n}: формат «{fields.get('format')}» ≠ «{fmt}»")
        r.check(fields.get("hours") == hours and w.attrs.get("data-hours") == hours, f"неделя {n}: а.ч. {fields.get('hours')} ≠ {hours}")
        r.check(fields.get("lead") == lead, f"неделя {n}: ведущий «{fields.get('lead')}» ≠ «{lead}»")
        r.check(fields.get("topics") == topics, f"неделя {n}: темы не совпадают с 02 дословно")
        r.check(fields.get("result") == result, f"неделя {n}: результат «{fields.get('result')}» ≠ «{result}»")
        mode = w.attrs.get("data-mode")
        r.check(mode == ("offline" if fmt.startswith("Очно") else "online"), f"неделя {n}: data-mode={mode} не соответствует «{fmt}»")
        if mode == "offline":
            offline.add(n)
            r.check(w.has_class("week--offline"), f"неделя {n}: очная неделя должна быть выделена (week--offline)")
        toggle = w.find("button", data_week_toggle=True)
        r.check(toggle is not None and toggle.attrs.get("aria-controls") == f"week-{n}-body", f"неделя {n}: нет кнопки раскрытия с aria-controls")
        total += int(w.attrs.get("data-hours") or 0)
    r.check(offline == OFFLINE_WEEKS, f"очные недели {sorted(offline)}, ожидается {sorted(OFFLINE_WEEKS)}")
    r.check(total == passport_total == 91, f"сумма а.ч. {total}, в паспорте «Итого» {passport_total}, ожидается 91")
    total_node = doc.find(data_total_hours=True)
    r.check(total_node is not None and total_node.attrs["data-total-hours"] == str(total), "итог таймлайна не совпадает с суммой недель")
    if total_node is not None and m:
        r.check(norm(total_node.text()) == norm(section[m.start():].splitlines()[0]), "строка «Итого» таймлайна не совпадает с 02")
    nodes = doc.find_all("a", data_week_link=True)
    rail = [a for a in nodes if a.has_class("rail__node")]
    r.check(len(rail) == 12, f"ось таймлайна: узлов {len(rail)}, ожидается 12")
    r.check({int(a.attrs["data-week-link"]) for a in rail if a.has_class("rail__node--offline")} == OFFLINE_WEEKS, "ось таймлайна: крупными должны быть узлы недель 1, 6, 11")
    controls = doc.find(data_timeline_controls=True)
    filters = [b.attrs.get("data-filter") for b in controls.find_all("button", data_filter=True)] if controls else []
    r.check(filters == ["all", "offline", "online"], f"фильтр «очно / онлайн»: {filters}")
    return total


def check_evidence(doc: Node, summary: str, appendix: str, r: Report):
    sec = doc.find("section", id="evidence")
    text = norm(sec.text()) if sec else ""
    for item in md_bullets(md_section(summary, "Почему так")):
        title, _, rest = item.partition(". ")
        r.check(norm(rest) in text, f"«Почему это работает»: нет дословного текста «{rest[:60]}…»")
    s1 = md_section(appendix, "[1]")
    s3 = md_section(appendix, "[3]")
    allowed = md_urls(s1) | md_urls(s3)
    shown = {a.attrs.get("href") for a in (sec.find_all("a") if sec else []) if (a.attrs.get("href") or "").startswith("http")}
    for url in sorted(shown - allowed):
        r.check(False, f"«Почему это работает»: ссылка {url} не из разделов [1] и [3] приложения")
    for url in sorted(allowed - shown):
        r.check(False, f"«Почему это работает»: не показана ссылка {url} из разделов [1]/[3] приложения")
    for a in (sec.find_all("a") if sec else []):
        if a.attrs.get("target") == "_blank":
            r.check("noopener" in (a.attrs.get("rel") or ""), f"ссылка {a.attrs.get('href')} с target=_blank без rel=noopener")
    for row in md_table(md_section(s1, "Проанализировано") if "### Проанализировано" in s1 else s1):
        if len(row) == 2:
            r.check(row[0] in text and row[1] in text, f"«Почему это работает»: нет строки «{row[0][:50]}» из [1]")


def check_evaluation(doc: Node, passport: str, r: Report):
    sec = doc.find("section", id="evaluation")
    steps = [n for n in (sec.iter() if sec else []) if n.tag == "li" and n.has_class("step")]
    expected = md_table(md_section(passport, "Уровень 5"))
    r.check(len(steps) == 4 and len(expected) == 4, f"оценка: уровней {len(steps)}, ожидается 4 (L1–L4)")
    for step, exp in zip(steps, expected):
        text = norm(step.text())
        for cell in exp:
            r.check(cell in text, f"оценка {exp[0]}: нет дословного «{cell}»")


def check_team(doc: Node, summary: str, appendix: str, r: Report):
    sec = doc.find("section", id="team")
    page_text = norm(doc.text())
    text = norm(sec.text()) if sec else ""
    for role, task, req in md_table(md_section(summary, "Команда")):
        for cell in (role, task, req):
            r.check(cell in text, f"«Наша команда»: нет «{cell}» из 01")
    lis = sec.find_all("li", data_consent=True) if sec else []
    by_slot = {}
    for li in lis:
        slot = next((p for p in li.iter() if p.has_class("candidate__slot")), None)
        if slot is not None:
            by_slot[norm(slot.text())] = li
    cands = re.findall(r"^(.+?\d): (.+?) \| (.+?) \| (.+?) \| Метка GRA", md_section(appendix, "[4]"), re.M)
    r.check(len(cands) == 4, f"приложение [4]: найдено кандидатов {len(cands)}")
    for slot, name, company, fact in cands:
        li = by_slot.get(norm(slot))
        r.check(li is not None, f"«Наша команда»: нет карточки «{slot}»")
        if li is None:
            continue
        consent = li.attrs.get("data-consent")
        li_text = norm(li.text())
        if consent == "true":
            r.check(norm(name) in li_text and norm(company) in li_text, f"«{slot}»: consent: true, но ФИО/компания не показаны")
        else:
            r.check(consent == "false", f"«{slot}»: data-consent должен быть true или false")
            r.check(norm(name) not in page_text, f"«{slot}»: consent: false, но ФИО «{name}» есть на странице")
            r.check(norm(fact) not in page_text, f"«{slot}»: consent: false, но факт из [4] есть на странице")
            r.check(norm(company) not in li_text, f"«{slot}»: consent: false, но компания показана в карточке")
            r.check(not any(n.tag == "a" for n in li.iter()), f"«{slot}»: consent: false, но в карточке есть ссылки")
    hidden_names = [norm(n) for s, n, c, f in cands if by_slot.get(norm(s)) is not None and by_slot[norm(s)].attrs.get("data-consent") == "false"]
    for name in hidden_names:
        r.check(name not in doc_source_cache["html"], f"ФИО «{name}» есть в HTML-коде страницы при consent: false")


def check_budget(doc: Node, r: Report, allow_missing_email: bool):
    sec = doc.find("section", id="budget")
    form = sec.find("form", data_budget_form=True) if sec else None
    r.check(form is not None, "нет формы «Запросить детальный бюджет»")
    if form is None:
        return
    names = [n.attrs.get("name") for n in form.iter() if n.tag in ("input", "select")]
    r.check(names == FORM_FIELDS, f"поля формы {names}, ожидается {FORM_FIELDS}")
    for n in form.iter():
        if n.tag in ("input", "select"):
            label = form.find("label", **{"for": n.attrs.get("id", "")})
            r.check(label is not None, f"у поля {n.attrs.get('name')} нет <label>")
    email = form.find("input", type="email")
    r.check(email is not None, "поле E-mail должно быть type=email")
    select = form.find("select", name="Размер группы")
    options = [o.attrs.get("value") for o in select.iter() if o.tag == "option"] if select else []
    r.check(options == [str(n) for n in range(20, 26)], f"размер группы: варианты {options}, ожидается строго 20–25")
    address = (form.attrs.get("data-email") or "").strip()
    action = form.attrs.get("action") or ""
    r.check(action.startswith("mailto:" + address), "action формы должен быть mailto: на budget_email")
    if address:
        r.check(re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", address) is not None, f"budget_email «{address}» не похож на e-mail")
    elif not allow_missing_email:
        r.check(False, "budget_email в _config.yml не заполнен: укажите адрес получателя запросов детального бюджета "
                       "(projects/ai-team-management-program/_config.yml, поле budget_email) и сделайте push в main")


def check_content_rules(source: str, doc: Node, r: Report):
    visible = norm(doc.text())
    for pattern, label in FORBIDDEN_MONEY:
        hit = re.search(pattern, visible, re.I)
        r.check(hit is None, f"на сайте есть коммерческие данные ({label}): «…{visible[max(0, hit.start() - 40):hit.end() + 40]}…»" if hit else "")
    for vendor in FORBIDDEN_VENDORS:
        hit = re.search(vendor if vendor.startswith("\\") else re.escape(vendor), visible)
        r.check(hit is None, f"на сайте названа сторонняя модель или вендор: «{vendor}»")
    for pattern, label in FORBIDDEN_META:
        hit = re.search(pattern, source, re.I)
        r.check(hit is None, f"в HTML есть служебное слово «{label}»")
    for m in re.finditer(r"(?<!\d)(?<!по )(\d+)\s*[–-]\s*(\d+)\s+(человек|руководител\w*|участник\w*)", visible):
        r.check((m.group(1), m.group(2)) == ("20", "25"), f"размер группы «{m.group(0)}», допускается только «20–25»")
    r.check("20–25 человек" in visible, "на странице нет формулировки «20–25 человек»")
    for m in re.finditer(r"по\s+(\d+)\s*[–-]\s*(\d+)\s+(человек|коллег)", visible):
        r.check((m.group(1), m.group(2)) == ("4", "5"), f"размер сета «{m.group(0)}», допускается только «4–5»")
    r.check("сетов по 4–5 человек" in visible or "сеты по 4–5 человек" in visible, "на странице нет формулировки о сетах по 4–5 человек")


def check_site_files(site: Path, r: Report):
    published = [p.relative_to(site).as_posix() for p in site.rglob("*") if p.is_file()]
    for p in published:
        r.check(not p.endswith(".md") and not p.startswith(("content/", "tests/", "docs/")) and p != "README.md",
                f"в публикацию попал служебный файл {p}")
    for js in ("assets/js/timeline.js", "assets/js/zones.js", "assets/css/site.css"):
        r.check(js in published, f"в публикации нет {js}")


doc_source_cache: dict[str, str] = {}


def run(site: Path, allow_missing_email: bool) -> Report:
    r = Report()
    index = site / "index.html"
    if not index.is_file():
        raise FileNotFoundError(f"нет {index}: сначала соберите сайт")
    source = index.read_text(encoding="utf-8")
    doc_source_cache["html"] = source
    doc = parse_html(source)
    summary = (CONTENT / "01-project-summary.md").read_text(encoding="utf-8")
    passport = (CONTENT / "02-project-passport.md").read_text(encoding="utf-8")
    appendix = (CONTENT / "03-appendix.md").read_text(encoding="utf-8")

    check_structure(doc, r)
    total = check_timeline(doc, passport, r)
    check_hero(doc, summary, total, r)
    check_outcomes(doc, summary, r)
    check_zones(doc, passport, r)
    check_evidence(doc, summary, appendix, r)
    check_evaluation(doc, passport, r)
    check_team(doc, summary, appendix, r)
    check_budget(doc, r, allow_missing_email)
    check_content_rules(source, doc, r)
    check_site_files(site, r)
    return r


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--site", type=Path, default=PROJECT.parent.parent / "_site", help="каталог собранного сайта")
    ap.add_argument("--allow-missing-email", action="store_true",
                    help="не считать ошибкой пустой budget_email (локальная сборка и pull request)")
    args = ap.parse_args(argv)
    try:
        r = run(args.site, args.allow_missing_email)
    except (FileNotFoundError, LookupError) as e:
        print(f"ОШИБКА: {e}", file=sys.stderr)
        return 2
    if r.errors:
        print(f"Проверка сайта: {len(r.errors)} расхождений (пройдено {r.passed}):", file=sys.stderr)
        for e in r.errors:
            print(f"  ✗ {e}", file=sys.stderr)
            if "budget_email" in e and "GITHUB_ACTIONS" in __import__("os").environ:
                print(f"::error title=Не указан адрес для запросов бюджета::{e}", file=sys.stderr)
        return 1
    print(f"Проверка сайта пройдена: {r.passed} проверок, расхождений с content/*.md нет.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
