#!/usr/bin/env python3
"""Проверка собранной цифровой брошюры против источников истины (content/*.md).

Запуск (после сборки Jekyll):

    python3 tests/check_site.py --site ../../_site/projects/ai-team-management-program
    python3 tests/check_site.py --site … --require-pdf   # brochure.pdf уже сгенерирован

Правило дословности (issue #61): каждый заголовок, абзац, пункт списка и ячейка
таблицы на странице совпадает с блоком content/*.md слово в слово (без учёта
переносов строк), и каждый блок источника есть на странице. Собственный текст
страницы — только служебные подписи интерфейса (UI_TEXT).

Правила финальной версии (issue #63): на веб-странице нет форм — только кнопка
«Скачать PDF-брошюру»; внешние ссылки открываются в новой вкладке
(target="_blank" rel="noopener noreferrer"); сокращение — «ак.ч.», не «а.ч.»;
раздел «Почему так» резюме в PDF-брошюру не входит (BROCHURE_SKIP).

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
REPO = PROJECT.parent.parent
CONTENT = PROJECT / "content"

# Веб-страница: разделы и их источники в порядке страницы.
SECTION_ORDER = ["top", "summary", "passport", "appendix"]
WEB_SOURCES = [
    ("summary", "content/01-project-summary.md"),
    ("passport", "content/02-project-passport.md"),
    ("appendix", "content/03-appendix.md"),
]
# Разделы H2, которые не публикуются на веб-странице (цены — только в PDF).
WEB_SKIP = {"content/01-project-summary.md": ["Экономика"]}
# Разделы H2, которые не входят в PDF-брошюру (issue #63) — то же правило, что
# _includes/drop-sections.html в brochure.html и PDF_SKIP в scripts/brochure-common.mjs.
BROCHURE_SKIP = {"content/01-project-summary.md": ["Почему так"]}

# PDF-брошюра: строгий порядок 01 → 02 → 05 → 03.
BROCHURE_ORDER = [
    ("doc-01", "content/01-project-summary.md"),
    ("doc-02", "content/02-project-passport.md"),
    ("doc-05", "content/05-detailed-economics.md"),
    ("doc-03", "content/03-appendix.md"),
]

NAV = [
    ("Резюме проекта", "#summary"),
    ("Паспорт проекта", "#passport"),
    ("Приложение", "#appendix"),
]
PDF_LINK_TEXT = "📥 Скачать PDF-брошюру программы"
PDF_HREF = "brochure.pdf"

PUBLISHED = {
    "index.html", "brochure.html", "brochure.pdf",
    "assets/css/site.css", "assets/css/brochure.css", "assets/favicon.svg",
}

# Цены, ставки и себестоимость на веб-странице не публикуются (RFC 04, правила контента);
# они есть только в PDF (content/01, раздел «Экономика», и content/05).
FORBIDDEN_MONEY = [
    (r"₽", "знак рубля"),
    (r"\bруб(?:\.|лей|ля|ль)?\b", "рубли"),
    (r"\bмлн\b", "млн (суммы)"),
    (r"\bNRE\b", "NRE"),
    (r"\bOPEX\b", "OPEX"),
    (r"\bCOGS\b", "COGS"),
    (r"себестоим", "себестоимость"),
    (r"\bмарж", "маржа"),
    (r"\bНДС\b", "НДС"),
    (r"\bФОТ\b", "ФОТ"),
]

# Регресс: текст и файлы прежнего портала и служебные слова.
FORBIDDEN_PORTAL = [
    (r"open-ai\.ru", "open-ai.ru"),
    (r"портал", "портал"),
]
FORBIDDEN_META = [
    (r"\bdraft\b", "draft"),
    (r"\bissue\s*#", "issue #"),
    (r"черновик", "черновик"),
    (r"lorem ipsum", "lorem ipsum"),
    # Финальная версия для стейкхолдеров: без истории правок (issue #63).
    (r"исправлен", "исправлено"),
    (r"\bверси[яюи]\s*\d", "версия N"),
    (r"\bбыло\b[^.]{0,80}\bстало\b", "было/стало"),
]

# Сокращение академического часа — «ак.ч.»; «а.ч.» не используется (issue #63).
OLD_HOURS = re.compile(r"(?<![А-Яа-яЁё])[аА]\.\s*ч\.")
EXTERNAL_REL = {"noopener", "noreferrer"}

CONTENT_TAGS = {"h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "th", "td"}
HEADINGS = {"h1", "h2", "h3", "h4", "h5", "h6"}

# ---------------------------------------------------------------- HTML tree -----

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


def squash(s: str) -> str:
    """Текст без пробелов и переносов строк: вёрстка переносит строки иначе, чем .md."""
    return re.sub(r"\s+", "", html.unescape(s))


# ------------------------------------------------------------ Markdown -----
# Те же правила, что в scripts/brochure-common.mjs (проверка PDF).

def inline(s: str) -> str:
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)
    return s.replace("**", "").strip()


def md_blocks(markdown: str) -> list[tuple[str, str]]:
    """Markdown → [(вид, текст)] в порядке файла; вид: h1–h6, p, li, td."""
    out: list[tuple[str, str]] = []
    for block in re.split(r"\n\s*\n", markdown.replace("\r", "")):
        lines = [l for l in block.split("\n") if l.strip()]
        if not lines:
            continue
        h = re.match(r"^(#{1,6}) (.*)$", lines[0])
        if h and len(lines) == 1:
            out.append((f"h{len(h.group(1))}", inline(h.group(2))))
        elif lines[0].startswith("|"):
            for line in lines:
                if re.match(r"^\|[\s:|-]+\|$", line):
                    continue
                for cell in re.sub(r"\|$", "", re.sub(r"^\|", "", line)).split("|"):
                    t = inline(cell)
                    if t:
                        out.append(("td", t))
        elif lines[0].startswith("- "):
            items: list[str] = []
            for line in lines:
                if line.startswith("- "):
                    items.append(line[2:])
                else:
                    items[-1] += " " + line.strip()
            out.extend(("li", inline(i)) for i in items)
        else:
            out.append(("p", inline(" ".join(lines))))
    return out


def md_tables(markdown: str) -> int:
    return sum(1 for b in re.split(r"\n\s*\n", markdown) if b.lstrip("\n").startswith("|"))


TEAM_YML = PROJECT / "_data" / "team.yml"


def parse_yaml(text: str):
    """YAML-подмножество _data/team.yml: словари, списки словарей, строки в кавычках,
    true/false, комментарии «#» в начале строки (стандартная библиотека не читает YAML).
    Тот же разбор — parseYaml в scripts/brochure-common.mjs."""
    lines = [l.rstrip() for l in text.replace("\r", "").split("\n") if l.strip() and not l.strip().startswith("#")]
    pos = 0

    def indent(line: str) -> int:
        return len(line) - len(line.lstrip())

    def scalar(v: str):
        v = v.strip()
        if v in ("true", "false"):
            return v == "true"
        q = re.fullmatch(r'"(.*)"', v)
        return q.group(1).replace('\\"', '"') if q else v

    def node(ind: int):
        nonlocal pos
        if lines[pos].lstrip().startswith("- "):
            items = []
            while pos < len(lines) and indent(lines[pos]) == ind and lines[pos].lstrip().startswith("- "):
                lines[pos] = " " * (ind + 2) + lines[pos].lstrip()[2:]
                items.append(node(ind + 2))
            return items
        mapping = {}
        while pos < len(lines) and indent(lines[pos]) == ind and not lines[pos].lstrip().startswith("- "):
            m = re.fullmatch(r"([\w-]+):(?:\s+(.*))?", lines[pos].strip())
            if not m:
                raise LookupError(f"team.yml: не разобрана строка «{lines[pos]}»")
            pos += 1
            if m.group(2) is not None:
                mapping[m.group(1)] = scalar(m.group(2))
            else:
                mapping[m.group(1)] = node(indent(lines[pos])) if pos < len(lines) and indent(lines[pos]) >= ind else None
        return mapping

    return node(indent(lines[0])) if lines else {}


def team(team_yml: Path = TEAM_YML) -> dict:
    return parse_yaml(team_yml.read_text(encoding="utf-8"))


def candidates(team_yml: Path = TEAM_YML) -> list[dict]:
    return team(team_yml).get("candidates") or []


def candidate_line(c: dict) -> str:
    """Строка кандидата раздела [4] — как в 03-appendix.md."""
    return f'{c["slot"]}: {c["name"]} | {c["company"]} | {c["fact"]} | Метка GRA: {c["gra"]}'


def sources_line(cands: list[dict]) -> str:
    return "**Источники:** " + "; ".join(
        f'{c["name"]} —' + ",".join(f' [{s["label"]}]({s["url"]})' for s in c["sources"]) for c in cands) + "."


TEAM_HEADING = "## [4] Кандидаты на роли"
TEAM_WEB_STUB = "Смотри [PDF](brochure.pdf)."


def web_appendix(markdown: str) -> str:
    """То же правило, что _includes/team.html (issue #65): на веб-странице текст раздела [4]
    (последний раздел 03-appendix.md) заменён абзацем «Смотри PDF.»; в PDF — полностью."""
    head = markdown.split(f"\n{TEAM_HEADING}\n")[0]
    return f"{head}\n{TEAM_HEADING}\n\n{TEAM_WEB_STUB}\n"


def check_team_data(data: dict, r: Report):
    """_data/team.yml дословно совпадает с SSOT: роли — с таблицей «Команда» (01),
    кандидаты и их источники — с разделом [4] (03). Изменить данные кандидата
    можно только вместе с content/03-appendix.md (issue #65)."""
    summary = (CONTENT / "01-project-summary.md").read_text(encoding="utf-8")
    appendix = (CONTENT / "03-appendix.md").read_text(encoding="utf-8")
    roles, cands = data.get("roles") or [], data.get("candidates") or []
    table = summary.split("\n## Команда\n")[1].split("\n## ")[0]
    rows = [[x.strip() for x in l.strip().strip("|").split("|")] for l in table.splitlines() if l.startswith("|")][2:]
    r.check([[x.get("name"), x.get("task"), x.get("requirement")] for x in roles] == rows,
            "_data/team.yml: roles (name, task, requirement) не совпадают с таблицей «Команда» в 01-project-summary.md")
    section = appendix.split("\n## [4] ")[1].split("\n## ")[0]
    paras = [" ".join(p.split()) for p in section.split("\n\n")]
    for x in roles:
        if x.get("note"):
            r.check(f'**{x["note"]}**' in paras, f'_data/team.yml: note роли «{x["name"]}» не совпадает с [4] в 03-appendix.md')
    ids = {x.get("id") for x in roles}
    rows4 = [p for p in paras if re.match(r"^[^|:]+ \d+: .*\| Метка GRA: ", p)]
    r.check(len(rows4) == len(cands), f"_data/team.yml: кандидатов {len(cands)}, а строк кандидатов в [4] — {len(rows4)}")
    for c in cands:
        slot = c.get("slot", "")
        role = next((x for x in roles if x.get("id") == c.get("role")), None)
        r.check(c.get("role") in ids and role is not None and slot.startswith(role["name"] + " "),
                f"_data/team.yml: у кандидата «{slot}» неверная роль «{c.get('role')}»")
        r.check(all(c.get(k) for k in ("name", "company", "fact", "gra", "sources")),
                f"_data/team.yml: у кандидата «{slot}» нет name, company, fact, gra или sources")
        if all(c.get(k) for k in ("name", "company", "fact", "gra")):
            r.check(candidate_line(c) in paras, f"_data/team.yml: данные кандидата «{slot}» не совпадают со строкой [4] в 03-appendix.md")
    src = next((p for p in paras if p.startswith("**Источники:**")), "")
    if all(c.get("sources") for c in cands):
        r.check(squash(sources_line(cands)) == squash(src),
                "_data/team.yml: sources кандидатов не совпадают со строкой «Источники:» в [4] 03-appendix.md")


def drop_sections(markdown: str, titles: list[str]) -> str:
    """Убирает разделы H2 с заголовками titles (как параметр skip в _includes/md-doc.html)."""
    parts = markdown.split("\n## ")
    return "\n## ".join([parts[0]] + [p for p in parts[1:] if p.split("\n", 1)[0].strip() not in titles])


def read_source(rel: str, data: dict, web: bool = False) -> str:
    md = (PROJECT / rel).read_text(encoding="utf-8")
    if web and rel.endswith("03-appendix.md"):
        md = web_appendix(md)
    skip = WEB_SKIP if web else BROCHURE_SKIP
    if rel in skip:
        md = drop_sections(md, skip[rel])
    return md


def config_value(key: str) -> str:
    m = re.search(rf'^{key}:\s*"?(.*?)"?\s*$', (REPO / "_config.yml").read_text(encoding="utf-8"), re.M)
    return m.group(1) if m else ""


# ---------------------------------------------------------------- HTML -----

def zone(node: Node) -> str:
    """'ui' — служебный интерфейс (шапка, подвал, кнопка PDF), иначе 'content'."""
    n: Node | None = node
    while n is not None:
        if n.tag in ("header", "footer", "title") or "data-pdf-link" in n.attrs:
            return "ui"
        n = n.parent
    return "content"


def text_nodes(node: Node):
    for c in node.children:
        if isinstance(c, str):
            yield c, node
        elif c.tag not in ("script", "style"):
            yield from text_nodes(c)


def nearest(node: Node | None, tags: set[str]) -> Node | None:
    while node is not None and node.tag not in tags:
        node = node.parent
    return node


def leaf_blocks(root: Node) -> list[Node]:
    """Элементы-блоки текста (заголовки, абзацы, пункты, ячейки) без вложенных блоков."""
    return [n for n in root.iter() if n.tag in CONTENT_TAGS and not any(d.tag in CONTENT_TAGS for d in n.iter())]


def content_text(node: Node) -> str:
    """Текст блока без служебных элементов внутри него (кнопка PDF в абзаце первого экрана)."""
    return "".join(t for t, parent in text_nodes(node) if zone(parent) != "ui")


def short(s: str, n: int = 70) -> str:
    s = re.sub(r"\s+", " ", html.unescape(s)).strip()
    return s if len(s) <= n else s[:n] + "…"


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


def check_verbatim(root: Node, sources: list[str], data: dict, r: Report, where: str, web: bool,
                   ui_text: set[str] | None = None):
    """Каждый блок текста — блок источника; каждый блок источника — на странице, в порядке файлов."""
    allowed = {"heading": set(), "p": set(), "li": set(), "td": set()}
    order: list[tuple[str, str, str]] = []
    for rel in sources:
        for kind, text in md_blocks(read_source(rel, data, web)):
            group = "heading" if kind in HEADINGS else kind
            allowed[group].add(squash(text))
            order.append((rel, kind, text))
    ui = {squash(t) for t in (ui_text or set())}

    for text, parent in text_nodes(root):
        if not text.strip():
            continue
        if zone(parent) == "ui":
            owner = parent
            r.check(squash(owner.text()) in ui,
                    f"{where}: служебный текст «{short(owner.text())}» не входит в подписи интерфейса")
            continue
        r.check(nearest(parent, CONTENT_TAGS) is not None,
                f"{where}: текст вне заголовков, абзацев, списков и таблиц: «{short(text)}»")

    for n in leaf_blocks(root):
        if zone(n) == "ui":
            continue
        group = "heading" if n.tag in HEADINGS else {"th": "td"}.get(n.tag, n.tag)
        t = squash(content_text(n))
        if not t:
            continue
        r.check(t in allowed[group],
                f"{where}: <{n.tag}> «{short(n.text())}» не совпадает дословно ни с одним блоком {', '.join(sources)}")

    text = squash(root.text())
    pos = 0
    for rel, kind, block in order:
        needle = squash(block)
        at = text.find(needle, pos)
        if at < 0:
            r.check(False, f"{where}: {rel}: {kind} «{short(block)}» "
                           f"{'стоит не по порядку' if needle in text else 'отсутствует'}")
            continue
        r.passed += 1
        pos = at + len(needle)


def headings(root: Node) -> list[tuple[int, str]]:
    return [(int(n.tag[1]), squash(n.text())) for n in root.iter() if n.tag in HEADINGS]


def md_headings(markdown: str) -> list[tuple[int, str]]:
    return [(int(k[1]), squash(t)) for k, t in md_blocks(markdown) if k in HEADINGS]


def check_structure(doc: Node, r: Report, title: str):
    root = doc.find("html")
    r.check(root is not None and root.attrs.get("lang") == "ru", "у <html> нет lang=\"ru\"")
    t = doc.find("title")
    r.check(t is not None and t.text().strip() == title, f"<title> должен быть «{title}» (title в _config.yml)")
    main = doc.find("main")
    r.check(main is not None, "нет <main>")
    if main is None:
        return
    ids = [s.attrs.get("id") for s in main.find_all("section") if nearest(s.parent, {"section"}) is None]
    r.check(ids == SECTION_ORDER, f"разделы страницы {ids}, ожидается {SECTION_ORDER}")
    nav = doc.find("nav")
    links = [(a.text().strip(), a.attrs.get("href")) for a in nav.find_all("a")] if nav else []
    r.check(links == NAV, f"меню {links}, ожидается {NAV}")
    for _, href in NAV:
        r.check(doc.find(id=href[1:]) is not None, f"пункт меню {href} ведёт на несуществующий раздел")
    scripts = [s.attrs.get("src") for s in doc.find_all("script")]
    r.check(scripts == [], f"на странице не должно быть скриптов, найдено {scripts}")
    for img in doc.find_all("img"):
        r.check(bool((img.attrs.get("alt") or "").strip()), f"у изображения {img.attrs.get('src')} нет alt")
    for n in doc.iter():
        for attr in ("src",):
            v = n.attrs.get(attr) or ""
            r.check(not v.startswith(("http:", "https:", "//")), f"внешний ресурс {v}")
        if n.tag == "link":
            v = n.attrs.get("href") or ""
            r.check(not v.startswith(("http:", "https:", "//")), f"внешний ресурс {v}")


def check_hero(doc: Node, summary_md: str, site: Path, r: Report, require_pdf: bool):
    hero = doc.find(id="top")
    if hero is None:
        r.check(False, "нет первого экрана (#top)")
        return
    blocks = md_blocks(summary_md)
    h1 = hero.find("h1")
    r.check(h1 is not None and squash(h1.text()) == squash(blocks[0][1]),
            f"заголовок первого экрана должен совпадать с H1 01-project-summary.md: «{blocks[0][1]}»")
    r.check(len(doc.find_all("h1")) == 1, "на странице должен быть один <h1>")
    sub = [n for n in leaf_blocks(hero) if n.tag == "p" and squash(content_text(n))]
    r.check(bool(sub) and squash(sub[0].text()) == squash(blocks[1][1]),
            f"подзаголовок первого экрана должен совпадать со строкой под H1: «{blocks[1][1]}»")
    links = doc.find_all("a", data_pdf_link=True)
    r.check(len(links) == 1, f"на странице должна быть одна ссылка на PDF (data-pdf-link), найдено {len(links)}")
    a = hero.find("a", data_pdf_link=True)
    r.check(a is not None, "ссылка на PDF-брошюру должна быть в первом экране")
    if a is None:
        return
    r.check(a.text().strip() == PDF_LINK_TEXT, f"текст ссылки на PDF «{a.text().strip()}», ожидается «{PDF_LINK_TEXT}»")
    r.check("download" in a.attrs, "у ссылки на PDF нет атрибута download")
    r.check(a.attrs.get("href") == PDF_HREF,
            f"href ссылки на PDF «{a.attrs.get('href')}», ожидается «{PDF_HREF}» (относительно страницы программы)")
    if require_pdf:
        pdf = site / PDF_HREF
        ok = pdf.is_file() and pdf.read_bytes()[:5] == b"%PDF-"
        r.check(ok, f"ссылка на PDF ведёт на {pdf}, а файла нет или это не PDF")


def check_no_form(doc: Node, r: Report):
    """Формы «Запросить бюджет» нет: на странице только кнопка «Скачать PDF-брошюру» (issue #63)."""
    r.check(doc.find("form") is None, "index.html: на странице не должно быть форм — только кнопка «Скачать PDF-брошюру»")
    r.check(doc.find(id="budget") is None, "index.html: раздел #budget (форма «Запросить бюджет») удалён")
    controls = [n.tag for n in doc.iter() if n.tag in ("input", "select", "textarea", "button")]
    r.check(not controls, f"index.html: на странице не должно быть полей и кнопок формы, найдено {controls}")
    r.check("mailto:" not in "".join(n.attrs.get("href") or n.attrs.get("action") or "" for n in doc.iter()),
            "index.html: на странице не должно быть mailto:")


def check_links(name: str, doc: Node, r: Report):
    """Внешние ссылки — с target="_blank" rel="noopener noreferrer" (issue #63)."""
    for a in doc.find_all("a"):
        href = a.attrs.get("href") or ""
        if not href.startswith(("http:", "https:", "//")):
            continue
        rel = set((a.attrs.get("rel") or "").split())
        r.check(a.attrs.get("target") == "_blank" and EXTERNAL_REL <= rel,
                f'{name}: внешняя ссылка {href} без target="_blank" rel="noopener noreferrer"')


def check_web(doc: Node, site: Path, data: dict, r: Report, title: str):
    ui = {title, PDF_LINK_TEXT, *(t for t, _ in NAV)}
    body = doc.find("body")
    if body is None:
        r.check(False, "нет <body>")
        return
    check_verbatim(body, [rel for _, rel in WEB_SOURCES], data, r, "index.html", web=True, ui_text=ui)
    hero = doc.find(id="top")
    for sid, rel in WEB_SOURCES:
        sec = doc.find(id=sid)
        if sec is None:
            continue
        md = read_source(rel, data, web=True)
        expected = md_headings(md)
        got = headings(sec)
        if sid == "summary":
            got = (headings(hero) if hero else []) + got
            shift = 0
        else:
            shift = 1  # H1 файла → заголовок раздела <h2>, H2 → <h3> в аккордеоне, H3 → <h4>
        r.check(got == [(lvl + shift, t) for lvl, t in expected],
                f"index.html #{sid}: заголовки и их уровни не совпадают с {rel}")
        tables = len(sec.find_all("table"))
        r.check(tables == md_tables(md), f"index.html #{sid}: таблиц {tables}, в {rel} — {md_tables(md)}")
        items = len(sec.find_all("li"))
        md_items = sum(1 for k, _ in md_blocks(md) if k == "li")
        r.check(items == md_items, f"index.html #{sid}: пунктов списка {items}, в {rel} — {md_items}")
    for sid in ("passport", "appendix"):
        sec = doc.find(id=sid)
        parts = sec.find_all("details") if sec else []
        r.check(bool(parts) and all(p.find("summary") is not None for p in parts),
                f"index.html #{sid}: разделы H2 должны быть аккордеонами <details>/<summary>")


def check_brochure(doc: Node, data: dict, r: Report, title: str):
    body = doc.find("body")
    arts = doc.find_all("article")
    got = [(a.attrs.get("id"), a.attrs.get("data-source")) for a in arts]
    r.check(got == BROCHURE_ORDER, f"brochure.html: разделы {got}, ожидается строго {BROCHURE_ORDER}")
    t = doc.find("title")
    r.check(t is not None and t.text().strip() == title, f"brochure.html: <title> должен быть «{title}»")
    r.check(doc.find("form") is None and doc.find("script") is None, "brochure.html: без форм и скриптов")
    if body is None:
        return
    check_verbatim(body, [rel for _, rel in BROCHURE_ORDER], data, r, "brochure.html", web=False, ui_text={title})
    for a, (aid, rel) in zip(arts, BROCHURE_ORDER):
        md = read_source(rel, data)
        r.check(headings(a) == md_headings(md), f"brochure.html #{aid}: заголовки H1–H6 не совпадают с {rel} (уровни и текст)")
        r.check(len(a.find_all("table")) == md_tables(md), f"brochure.html #{aid}: число таблиц не совпадает с {rel}")
        md_items = sum(1 for k, _ in md_blocks(md) if k == "li")
        r.check(len(a.find_all("li")) == md_items, f"brochure.html #{aid}: число пунктов списка не совпадает с {rel}")
        h1 = a.find_all("h1")
        r.check(len(h1) == 1 and a.find(None) is h1[0], f"brochure.html #{aid}: раздел должен начинаться со своего H1")
        for skipped in BROCHURE_SKIP.get(rel, []):
            r.check(all(squash(h.text()) != squash(skipped) for h in a.find_all("h2")),
                    f"brochure.html #{aid}: раздел «{skipped}» в PDF-брошюру не входит")


def check_rules(name: str, source: str, doc: Node, data: dict, r: Report, money: bool):
    web_page = money  # index.html — веб-страница, brochure.html — источник PDF
    visible = re.sub(r"\s+", " ", doc.text())
    if money:
        for pattern, label in FORBIDDEN_MONEY:
            hit = re.search(pattern, visible)
            r.check(hit is None, f"{name}: на веб-странице есть коммерческие данные ({label}): "
                                 f"«…{visible[max(0, hit.start() - 40):hit.end() + 40]}…»" if hit else "")
    for pattern, label in FORBIDDEN_PORTAL + FORBIDDEN_META:
        r.check(re.search(pattern, source, re.I) is None, f"{name}: есть «{label}» — текст прежнего портала или служебное слово")
    hit = OLD_HOURS.search(visible)
    r.check(hit is None, f"{name}: сокращение «а.ч.» вместо «ак.ч.»: «…{visible[max(0, hit.start() - 40):hit.end() + 20]}…»"
            if hit else "")
    check_links(name, doc, r)
    for c in data.get("candidates") or []:
        if web_page:
            r.check(c["name"] not in source and squash(c["fact"]) not in squash(visible),
                    f"{name}: кандидат «{c['slot']}» на веб-странице — раздел [4] только в PDF (issue #65)")
        else:
            r.check(squash(candidate_line(c)) in squash(visible),
                    f"{name}: нет строки кандидата «{c['slot']}» из [4] — в PDF раздел выводится полностью")
            for s in c["sources"]:
                r.check(f'href="{s["url"]}"' in source, f"{name}: нет гиперссылки «{s['label']}» кандидата «{c['slot']}»")
    if web_page:
        r.check(squash("[4] Кандидаты на роли Смотри PDF.") in squash(visible),
                f"{name}: нет «[4] Кандидаты на роли — смотри PDF» (issue #65)")


def check_site_files(site: Path, r: Report, require_pdf: bool):
    published = {p.relative_to(site).as_posix() for p in site.rglob("*") if p.is_file()}
    for p in sorted(published - PUBLISHED):
        r.check(False, f"в публикацию попал лишний файл {p} (допускаются: {', '.join(sorted(PUBLISHED))})")
    need = PUBLISHED if require_pdf else PUBLISHED - {"brochure.pdf"}
    for p in sorted(need - published):
        r.check(False, f"в публикации нет {p}")


def run(site: Path, require_pdf: bool = False) -> Report:
    r = Report()
    index = site / "index.html"
    brochure = site / "brochure.html"
    for f in (index, brochure):
        if not f.is_file():
            raise FileNotFoundError(f"нет {f}: сначала соберите сайт")
    title = config_value("title")
    data = team()
    check_team_data(data, r)
    summary = read_source("content/01-project-summary.md", data, web=True)
    r.check(bool(title) and squash(title) in squash(md_blocks(summary)[0][1]),
            "title в _config.yml должен быть частью H1 01-project-summary.md")

    src = index.read_text(encoding="utf-8")
    doc = parse_html(src)
    check_structure(doc, r, title)
    check_hero(doc, summary, site, r, require_pdf)
    check_web(doc, site, data, r, title)
    check_no_form(doc, r)
    check_rules("index.html", src, doc, data, r, money=True)

    bsrc = brochure.read_text(encoding="utf-8")
    bdoc = parse_html(bsrc)
    check_brochure(bdoc, data, r, title)
    check_rules("brochure.html", bsrc, bdoc, data, r, money=False)

    check_site_files(site, r, require_pdf)
    return r


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--site", type=Path, default=REPO / "_site" / "projects" / "ai-team-management-program",
                    help="каталог собранного сайта программы")
    ap.add_argument("--require-pdf", action="store_true", help="brochure.pdf должен быть в каталоге сборки")
    args = ap.parse_args(argv)
    try:
        r = run(args.site, args.require_pdf)
    except (FileNotFoundError, LookupError, IndexError) as e:
        print(f"ОШИБКА: {e}", file=sys.stderr)
        return 2
    if r.errors:
        print(f"Проверка сайта: {len(r.errors)} расхождений (пройдено {r.passed}):", file=sys.stderr)
        for e in r.errors:
            print(f"  ✗ {e}", file=sys.stderr)
        return 1
    print(f"Проверка сайта пройдена: {r.passed} проверок, текст совпадает с content/*.md слово в слово.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
