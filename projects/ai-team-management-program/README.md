# «ИИ в работе с командой» — цифровая брошюра программы

Веб-страница и PDF-брошюра корпоративной программы «ИИ в работе с командой».
Весь текст берётся дословно из файлов `content/*.md` (SSOT): без пересказа,
сокращений и рекламных формулировок. Шаблоны меняют только оформление —
раскрывающиеся блоки, таблицы, уровни заголовков на веб-странице. Внешние
ссылки открываются в новой вкладке (`target="_blank" rel="noopener noreferrer"`,
`_includes/ext-links.html`).

- Веб-страница: <https://g-ivan-a.github.io/open-ai.ru/projects/ai-team-management-program/>
  (корень <https://g-ivan-a.github.io/open-ai.ru/> перенаправляет сюда).
- PDF: <https://g-ivan-a.github.io/open-ai.ru/projects/ai-team-management-program/brochure.pdf>.
- Движок: Jekyll без внешних тем (`actions/jekyll-build-pages`, gem `github-pages`);
  PDF — Puppeteer (системный Chrome).
- Публикация: [`.github/workflows/pages.yml`](../../.github/workflows/pages.yml),
  проверка в pull request: [`.github/workflows/pages-check.yml`](../../.github/workflows/pages-check.yml).

## Что публикуется

| Файл | Содержание |
| --- | --- |
| `index.html` | Первый экран: H1 и строка под ним из `01-project-summary.md`, ссылка «📥 Скачать PDF-брошюру программы». Далее — «Резюме проекта» (01, без раздела «Экономика»), «Паспорт проекта» (02) и «Приложение» (03). Форм на странице нет. |
| `brochure.html` | Страница для печати: текст 01 (без раздела «Почему так») → 02 → 05 → 03, у каждого файла свой H1, заголовки H1/H2/H3, списки и таблицы — как в `.md`. Источник PDF. |
| `brochure.pdf` | brochure.html, напечатанная в A4 с полями 2 см; шрифты с кириллицей (Liberation Sans, DejaVu Sans) встроены. Закладки — по заголовкам. |

Цены (`05-detailed-economics.md` и раздел «Экономика» из 01) на веб-странице не
выводятся: они есть только в PDF-брошюре (расчёт — для группы 25 человек).

Раздел «Почему так» из `01-project-summary.md` выводится на веб-странице, но в
PDF не входит: его убирает `_includes/drop-sections.html` в `brochure.html`
(то же правило — `PDF_SKIP` в `scripts/brochure-common.mjs` и `BROCHURE_SKIP`
в `tests/check_site.py`).

## Как обновить контент

1. Заменить файлы в `content/` (копии из
   `G-Ivan-A/hybrid-Intelligence-lab`, `projects/ai-team-management-program/pop-3m/`).
2. Сделать push в `main` (или открыть pull request).

Workflow соберёт страницу и PDF и сверит их с `content/*.md`. Если в шаблоне
что-то разошлось с источником, проверка падает со списком расхождений.

`brochure.pdf` лежит и в репозитории (`projects/ai-team-management-program/brochure.pdf`):
при «Deploy from a branch» GitHub Pages публикует файлы из `main` как есть. Когда
`content/` меняется, job `sync-pdf` в `pages.yml` коммитит свежий PDF в `main` и
запускает сборку Pages. Актуальность определяется по хешу `ssot-sha256:` в
метаданных PDF (Keywords): это хеш собранной `brochure.html`, `brochure.css`
и `scripts/build-pdf.mjs`.

## Структура каталога

```text
projects/ai-team-management-program/
  README.md                 # навигация (не публикуется)
  index.html                # веб-брошюра: 01, 02, 03
  brochure.html             # страница для PDF: 01 → 02 → 05 → 03
  brochure.pdf              # PDF-брошюра (генерируется, см. выше)
  _layouts/default.html     # каркас веб-страницы: шапка, навигация, подвал
  _includes/
    hero.html               #   первый экран и ссылка на PDF
    md-doc.html             #   вывод одного файла content/*.md на веб-странице
    team.html               #   раздел [4] «Кандидаты на роли» из _data/team.yml по правилу согласия
    drop-sections.html      #   разделы H2, которые не входят в PDF («Почему так»)
    ext-links.html          #   target="_blank" rel="noopener noreferrer" у внешних ссылок
  _data/team.yml            # роли и требования (01), кандидаты [4] (03), флаг consent
  assets/
    css/site.css            # стили веб-страницы: от 360 px, контраст WCAG AA
    css/brochure.css        # стили печати: A4, поля 2 см, шрифты
    favicon.svg
  content/                  # источники истины (не публикуются)
    01-project-summary.md
    02-project-passport.md
    03-appendix.md
    05-detailed-economics.md
  scripts/                  # генерация и проверка PDF (Node.js ≥ 22.13)
    brochure-common.mjs     #   порядок файлов, разбор Markdown, правило согласия, хеш
    build-pdf.mjs           #   brochure.html → brochure.pdf
    check-pdf.mjs           #   сверка PDF с content/*.md
    pdf-hash.mjs            #   хеш сборки / хеш в PDF
  package.json              # puppeteer-core, pdf-lib, pdfjs-dist (не публикуется)
  tests/                    # проверки сборки (не публикуются)
    check_site.py           #   сверка index.html и brochure.html с content/*.md
    test_check_site.py      #   регрессия: каждое нарушение ловится проверкой
    check_contrast.py       #   контраст палитры по WCAG AA
  docs/screenshots/         # снимки страницы и PDF для ревью (не публикуются)
```

Каталоги вне списка
[project-structure-inheritance](https://github.com/G-Ivan-A/hybrid-Intelligence-lab/blob/main/standards/project-structure-inheritance.md)
стандарта Хаба:

| Каталог | Почему нужен |
| --- | --- |
| `_layouts/`, `_includes/`, `_data/`, `assets/` | Соглашения Jekyll: без них сборка не находит макеты, include-файлы и данные. |
| `content/` | Копии исходных артефактов (SSOT), из которых строятся страница и PDF. |
| `scripts/` | Генерация и проверка PDF — обязательный шаг workflow публикации. |
| `tests/` | Проверки, которые запускает workflow до публикации. В `experiments/` их держать нельзя: это не эксперименты, а обязательный шаг публикации. |

Файлы вне каталога проекта:

- `.github/workflows/pages.yml` и `pages-check.yml` — GitHub Actions читает
  workflow только из `.github/workflows/` в корне репозитория. Оба workflow
  срабатывают только на изменения этого каталога (`paths`).
- `_config.yml` в корне — настройки сайта (`title`, `description`, `includes_dir`,
  `layouts_dir`, `data_dir`, исключения). GitHub Pages («Deploy from a branch:
  main, /») собирает репозиторий из корня и читает только корневой `_config.yml`;
  материалы портала исключены из публикации.
- `index.html` в корне — редирект на страницу программы.
- `_site/` в корне — временный результат сборки, в git не попадает.

## Что проверяется

`tests/check_site.py` (только стандартная библиотека Python 3):

- **Дословность.** Каждый заголовок, абзац, пункт списка и ячейка таблицы
  `index.html` и `brochure.html` совпадает с блоком `content/*.md` (без учёта
  разметки и переносов строк); все блоки источников присутствуют, в их порядке.
  Текст вне таких блоков допускается только в шапке, подвале и на кнопке PDF.
- **Структура.** Порядок разделов страницы; `brochure.html` — строго
  01 → 02 → 05 → 03, уровни заголовков H1–H6, число таблиц и пунктов списков —
  как в источнике.
- **Первый экран.** H1 — из 01; ссылка «📥 Скачать PDF-брошюру программы» с
  атрибутом `download` ведёт на `brochure.pdf` (с `--require-pdf` — файл существует).
- **Без формы.** На веб-странице нет `<form>`, полей ввода, `mailto:` и скриптов —
  только кнопка «📥 Скачать PDF-брошюру программы».
- **Ссылки.** Каждая внешняя ссылка `index.html` и `brochure.html` — с
  `target="_blank"` и `rel="noopener noreferrer"`.
- **Финальная версия.** Нет сокращения «а.ч.» (только «ак.ч.»), пометок о правках
  («исправлено», «версия N», «было/стало»); раздела «Почему так» в `brochure.html` нет.
- **Команда.** `_data/team.yml` совпадает с источниками: роли и требования — со
  строками таблицы «Команда» в 01, строки кандидатов, легенда и «Источники:» —
  с разделом [4] в 03, число кандидатов — с числом их строк в [4]. Для каждого
  кандидата без согласия на странице и в PDF есть строка роли с требованием.
- **Регресс.** Нет текста прежнего портала (`open-ai.ru`, «портал») и служебных
  пометок; цен на веб-странице; имён кандидатов без согласия; опубликованы только
  `index.html`, `brochure.html`, `brochure.pdf` и `assets/` (никаких `.md`, данных,
  скриптов и файлов прежних разделов).

`scripts/check-pdf.mjs`:

- каждая страница — A4, весь текст внутри полей 2 см;
- закладки верхнего уровня — H1 файлов в порядке 01 → 02 → 05 → 03, каждый файл
  начинается с новой страницы;
- все блоки `content/*.md` есть в тексте PDF в порядке файлов;
- шрифты встроены, кириллица извлекается без «�»;
- имён и фактов кандидатов без согласия нет, строки их ролей есть; хеш в метаданных совпадает со сборкой;
- текста раздела «Почему так» и сокращения «а.ч.» в PDF нет.

## Согласие кандидатов (`consent`)

`_data/team.yml` — данные раздела [4] «Кандидаты на роли» (SSOT:
`hybrid-Intelligence-lab`, `pop-3m/03-appendix.md`, [4]; роли и требования —
таблица «Команда» в `pop-3m/01-project-summary.md`):

- `roles` — `id`, `name`, `task`, `requirement` (и `note` для куратора);
- `candidates` — в порядке [4]: `role`, `slot` («Ведущий эксперт 1»), `consent`,
  `name`, `company`, `fact`, `gra`, `sources` (`label`, `url`).

Правило вывода (`_includes/team.html`; то же — `teamFilter` в
`scripts/brochure-common.mjs` и `team_filter` в `tests/check_site.py`):

- `consent: false` — строка роли **не скрывается**: выводится
  «Ведущий эксперт 1 | Требование: 5+ лет в ИИ, опыт обучения руководителей».
  ФИО, компания, факт, метка GRA и ссылки кандидата не выводятся;
- `consent: true` — полная строка кандидата из [4] дословно и его ссылки в
  строке «Источники:»;
- легенда «Метка GRA:» и строка «Источники:» выводятся, если опубликован хотя бы
  один кандидат; строка куратора и остальной текст 03 — всегда, дословно.

Ставить `consent: true` можно только после письменного согласия кандидата.
Проверить все состояния: `sh experiments/consent-matrix.sh all` (все согласны —
[4] совпадает с 03 дословно) или `first` (согласен первый кандидат); файл
`team.yml` после прогона восстанавливается.

## Экономика (01 и 05)

Все расчёты — для группы 25 человек; источник цифр — `05-detailed-economics.md`,
`tests/test_check_site.py` пересчитывает их из таблиц:

- выручка = 20 × 175 000 ₽ + 5 × 140 000 ₽ = 4 200 000 ₽ (участник с 21-го по
  25-й — 80% базовой цены);
- себестоимость первого потока = NRE 2 410 000 ₽ + OPEX 2 220 800 ₽ = 4 630 800 ₽;
  повторного — OPEX 2 220 800 ₽ (= 2 116 800 ₽ за 20 участников + 5 × 20 800 ₽);
- маржа = (выручка − себестоимость) / выручка: первый поток −10,3%, повторный 47,1%.

## Публикация: однократная настройка

Обязательных шагов нет: брошюра и PDF публикуются при обоих источниках Pages.

- **Источник Pages.** При «Deploy from a branch» (текущая настройка) сайт
  публикует штатная «pages build and deployment», `brochure.pdf` берётся из
  репозитория (его обновляет job `sync-pdf`). Если `main` защищён от push
  `github-actions[bot]`, job завершится ошибкой с подсказкой. Рекомендуемая
  настройка — Settings → Pages → Source: **GitHub Actions**: тогда job `deploy`
  публикует `_site` вместе с только что сгенерированным PDF, коммит не нужен.

## Локальная сборка и проверки

Из корня репозитория (нужны Docker, Node.js ≥ 22.13, Chrome или Chromium, шрифты
Liberation Sans или DejaVu Sans):

```sh
# 1. Jekyll — тем же образом, что actions/jekyll-build-pages (или sh experiments/build-site.sh)
docker run --rm -v "$PWD":/github/workspace -e GITHUB_WORKSPACE=/github/workspace \
  -e INPUT_SOURCE=. -e INPUT_DESTINATION=./_site \
  -e GITHUB_REPOSITORY=G-Ivan-A/open-ai.ru -e INPUT_TOKEN="$(gh auth token)" \
  ghcr.io/actions/jekyll-build-pages:v1.0.13
sudo chown -R "$(id -u):$(id -g)" _site

# 2. PDF и его проверка (CHROME_PATH — если Chrome не в PATH)
cd projects/ai-team-management-program
npm ci
npm run pdf                       # → _site/projects/ai-team-management-program/brochure.pdf
npm run check:pdf
npm run pdf -- --out brochure.pdf # обновить копию в репозитории
cd ../..

# 3. Проверки страницы
python3 projects/ai-team-management-program/tests/check_contrast.py
SITE_DIR=_site/projects/ai-team-management-program python3 -m unittest discover -s projects/ai-team-management-program/tests -p "test_*.py"
python3 projects/ai-team-management-program/tests/check_site.py --site _site/projects/ai-team-management-program --require-pdf
```
