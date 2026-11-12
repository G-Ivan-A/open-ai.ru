# «ИИ в работе с командой» — сайт-презентация программы

Публичный одностраничный сайт корпоративной программы «ИИ в работе с командой»:
11 недель от ручной рутины к собственным ИИ-агентам, 20–25 руководителей,
3 очных блока, 91 а.ч.

- Адрес публикации: <https://g-ivan-a.github.io/open-ai.ru/>
- Движок: Jekyll без внешних тем (сборка `actions/jekyll-build-pages`, gem `github-pages`).
- Публикация: [`.github/workflows/pages.yml`](../../.github/workflows/pages.yml),
  проверка в pull request: [`.github/workflows/pages-check.yml`](../../.github/workflows/pages-check.yml).

## Как обновить контент

Как обновить контент: заменить файлы в `content/` и данные в `_data/` внутри этого каталога, затем сделать push в `main`.

После push в `main` workflow `pages.yml` собирает сайт из этого каталога, сверяет
страницу с `content/*.md` (`tests/check_site.py`) и публикует её. Если данные в
`_data/` разошлись с `content/`, публикация останавливается со списком
расхождений: исправьте `_data/` и повторите push.

Правила переноса текстов в `_data/`:

- тексты и цифры переносятся из `content/` дословно: без сокращений, обобщений
  и новых фактов; меняется только структура и оформление;
- называется только JustAI; остальные модели — «российские модели» и «модели
  в контуре компании»;
- цены, ставки экспертов и себестоимость на сайт не переносятся;
- размер группы — строго «20–25 человек», сеты — «по 4–5 человек».

## Структура каталога

```text
projects/ai-team-management-program/
  README.md                 # навигация (не публикуется)
  _config.yml               # настройки сайта, budget_email, исключения из сборки
  index.html                # страница: подключает 8 разделов по порядку
  _layouts/default.html     # каркас: шапка, навигация, подвал, подключение CSS/JS
  _includes/                # по одному файлу на раздел страницы
    hero.html               #   1. Лендинг-хук: цель и 4 счётчика
    outcomes.html           #   2. Что получает руководитель
    data-zones.html         #   3. Светофор данных
    timeline.html           #   4. Интерактивный таймлайн, недели 0–11
    evidence.html           #   5. Почему это работает
    evaluation.html         #   6. Как мы измеряем результат (L1–L4)
    team.html               #   7. Наша команда
    budget.html             #   8. Запросить детальный бюджет
  _data/
    timeline.yml            # 12 недель: формат, а.ч., ведущий, темы, результат
    team.yml                # роли и кандидаты, флаг consent
    metrics.yml             # счётчики, факты и ссылки, уровни оценки L1–L4
    program.yml             # заголовки, бизнес-цель, результаты, зоны данных
  assets/
    css/site.css            # стили: адаптив от 360 px, контраст WCAG AA
    js/timeline.js          # раскрытие недель, фильтр «очно / онлайн»
    js/zones.js             # переключатель зон «Светофора данных»
    js/budget.js            # проверка формы и сборка письма mailto:
    favicon.svg
  content/                  # источники истины (не публикуются)
    01-project-summary.md
    02-project-passport.md
    03-appendix.md
  tests/                    # проверки сборки (не публикуются)
    check_site.py           # сверка страницы с content/*.md и ограничениями
    test_check_site.py      # регрессия: каждое нарушение ловится проверкой
    check_contrast.py       # контраст палитры по WCAG AA
  docs/screenshots/         # снимки страницы для ревью (не публикуются)
```

Каталоги вне списка
[project-structure-inheritance](https://github.com/G-Ivan-A/hybrid-Intelligence-lab/blob/main/standards/project-structure-inheritance.md)
стандарта Хаба:

| Каталог | Почему нужен |
| --- | --- |
| `_layouts/`, `_includes/`, `_data/`, `assets/` | Соглашения Jekyll: без них сборка не находит макеты, разделы и данные. Требование постановки. |
| `content/` | Копии исходных артефактов (SSOT), с которыми сверяется сайт. Указан в постановке как место обновления контента. |
| `tests/` | Проверки, которые запускает workflow до публикации. В `experiments/` их держать нельзя: это не эксперименты, а обязательный шаг публикации. |

Файлы вне каталога проекта:

- `.github/workflows/pages.yml` и `pages-check.yml` — GitHub Actions читает
  workflow только из `.github/workflows/` в корне репозитория. Оба workflow
  срабатывают только на изменения этого каталога (`paths`) и не затрагивают
  другие проекты портала.
- `_site/` в корне — временный результат сборки, в git не попадает.

## Источники истины по разделам

| Раздел | Данные | Источник |
| --- | --- | --- |
| 1. Лендинг-хук | `program.yml`, `metrics.yml` → `counters` | 01: заголовок, «Бизнес-цель», «Почему так»; 02: «91 академический час», уровень 1 (KPI 1) |
| 2. Что получает руководитель | `program.yml` → `outcomes` | 01: «Что получает руководитель» |
| 3. Светофор данных | `program.yml` → `zones` | 02: уровень 2, «Классификация данных» |
| 4. Таймлайн | `timeline.yml` | 02: уровень 3, «Модульная структура»; названия блоков — 01, «Программа» |
| 5. Почему это работает | `metrics.yml` → `why`, `research`, `findings`, `stack` | 01: «Почему так»; 03: [1] и [3] |
| 6. Как мы измеряем результат | `metrics.yml` → `evaluation` | 02: уровень 5 |
| 7. Наша команда | `team.yml` | 01: «Команда»; 03: [4] |
| 8. Запросить детальный бюджет | `_config.yml` → `budget_email` | 02: «Размер группы» |

Число академических часов в счётчике и заголовке таймлайна не хранится отдельно:
шаблон суммирует `hours` недель из `_data/timeline.yml`, проверка сверяет сумму
со строкой «Итого» паспорта (91).

## Согласие кандидатов (`consent`)

У каждого кандидата в `_data/team.yml` есть поле `consent`:

- `consent: false` — на сайте показываются только роль и требования к ней.
  ФИО, компания, релевантный факт, метка GRA и ссылки на источники в HTML не
  попадают (`_includes/team.html`, ветка `else`);
- `consent: true` — карточка показывает ФИО, компанию, факт, метку GRA и
  источники.

Ставить `consent: true` можно только после письменного согласия кандидата.
`tests/check_site.py` проверяет, что при `consent: false` ФИО и факт кандидата
отсутствуют в HTML страницы.

## Публикация: однократная настройка

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
   Пока источник — «Deploy from a branch», шаг `Check Pages source` в job
   `deploy` останавливает публикацию с сообщением, что нужно переключить.
2. **Заполнить `budget_email` в `_config.yml`** — адрес, на который приходят
   запросы детального бюджета. Пока поле пустое, форма показывает
   предупреждение, а проверка на `main` останавливает публикацию с сообщением,
   какое поле заполнить. В pull request пустой адрес — предупреждение.

GitHub Pages публикует один сайт на репозиторий: после переключения источника
по адресу <https://g-ivan-a.github.io/open-ai.ru/> открывается этот сайт.

## Локальная сборка и проверки

Сборка тем же образом, что и в workflow (нужен Docker), из корня репозитория:

```sh
docker run --rm -v "$PWD":/github/workspace -e GITHUB_WORKSPACE=/github/workspace \
  -e INPUT_SOURCE=./projects/ai-team-management-program -e INPUT_DESTINATION=./_site \
  -e GITHUB_REPOSITORY=G-Ivan-A/open-ai.ru -e INPUT_TOKEN="$(gh auth token)" \
  ghcr.io/actions/jekyll-build-pages:v1.0.13
```

Проверки (только стандартная библиотека Python 3):

```sh
python3 projects/ai-team-management-program/tests/check_contrast.py
SITE_DIR=_site python3 -m unittest discover -s projects/ai-team-management-program/tests -p "test_*.py"
python3 projects/ai-team-management-program/tests/check_site.py --site _site --allow-missing-email
```

Флаг `--allow-missing-email` нужен только до заполнения `budget_email`.

## Поведение страницы

- Без JavaScript все зоны и все недели раскрыты, форма отправляется через
  `mailto:`. Скрипты добавляют переключатель зон, раскрытие недель по клику,
  фильтр «очно / онлайн» и проверку формы.
- Ссылка `#week-N` открывает нужную неделю таймлайна.
- Кнопки управления доступны с клавиатуры (`aria-pressed`, `aria-expanded`),
  изменения фильтров объявляются экранным чтецам (`role="status"`).
- Анимации отключаются при `prefers-reduced-motion`.
