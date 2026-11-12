"""Регресс 9 утверждённых правок (issue #63/#65) на собранном сайте и в тексте PDF.
python3 experiments/regression-9.py <site_dir> <pdf_text.txt>"""
import re, sys, html
site, pdftxt = sys.argv[1], sys.argv[2]
def text(f):
    h = open(f"{site}/{f}", encoding="utf-8").read()
    h = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", h, flags=re.S)
    return h, " ".join(html.unescape(re.sub(r"<[^>]+>", " ", h)).split())
ih, it = text("index.html"); bh, bt = text("brochure.html")
pt = " ".join(open(pdftxt, encoding="utf-8").read().split())
ok = True
def check(n, name, cond):
    global ok; ok &= bool(cond); print(f"{'OK ' if cond else 'FAIL'} {n}. {name}")
H1 = "«ИИ в работе с командой»: от ручной рутины к использованию ИИ-агентов"
check(1, "заголовок", all(H1 in t for t in (it, bt, pt)) and "11 недель от ручной рутины" not in it + bt + pt)
check(2, "подзаголовок", all("программа на 3 месяца для группы 20–25 человек" in t for t in (it, bt, pt)))
check(3, "бизнес-цель", all("Трансформация стиля управления руководителя" in t for t in (it, bt, pt)) and "управления 25 руководителей" not in it + bt + pt)
check(4, "«Своих ИИ-агентов на базе решений JustAI:»", all("Своих ИИ-агентов на базе решений JustAI:" in t for t in (it, bt, pt)))
check(5, "«ак.ч.» вместо «а.ч.»", not re.search(r"(?<![а-яё])а\.ч\.", it + bt + pt) and "ак.ч." in pt)
check(6, "«Почему так» — на сайте, не в PDF", "Почему так" in it and "Почему так" not in bt and "Почему так" not in pt)
check(7, "экономика на 25 человек", "4 200 000 ₽ (4,20 млн ₽)" in bt and "−10,3%" in pt and "47,1%" in pt and "4,20" not in it)
check(8, "внешние ссылки в новом окне", all('target="_blank"' in a and 'rel="noopener noreferrer"' in a for a in re.findall(r'<a [^>]*href="https?://[^>]*>', ih + bh)))
check(9, "формы «Запросить бюджет» нет", not re.search(r"<form|<input|mailto:|Запросить", ih))
sys.exit(0 if ok else 1)
