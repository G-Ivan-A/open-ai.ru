# open-ai.ru

AI-native платформа для работы гибридных команд и запуска флагманских
направлений open-ai.ru:

- БА: бизнес-анализ, требования, процессы, продуктовая постановка.
- Репутационный инжиниринг: анализ, проектирование и сопровождение доверия.

## Статус
Phase 0: Planning & Vision

## Точка входа

Этот репозиторий находится в минимальном bootstrap-состоянии. В корне лежат
контракты, которые помогают Founder и AI-агенту работать без лишней бюрократии:

- [AI_GOVERNANCE.md](AI_GOVERNANCE.md) — правила работы ИИ в репозитории.
- [AI_HANDOVER_PROMPT.md](AI_HANDOVER_PROMPT.md) — промпт передачи контекста
  между сессиями.
- [AI_QUICK_RULES.md](AI_QUICK_RULES.md) — короткие правила для быстрого старта.

## Документация

- Product Vision (L1): [docs/vision.md](docs/vision.md)
- Product Concept (L2): [docs/product-concept.md](docs/product-concept.md)
- Solution Concept (L3): [docs/solution-concept.md](docs/solution-concept.md)
- ADR (L4): [docs/adr/](docs/adr/)

## Проекты

Сайт <https://g-ivan-a.github.io/open-ai.ru/> открывается стартовой страницей
([hub/](hub/)) с двумя входами:

- [projects/ai-team-management-program/](projects/ai-team-management-program/README.md) —
  цифровая брошюра корпоративной программы «ИИ в работе с командой»
  (сборка на Node) и её PDF-версия `brochure.pdf`.
- [projects/mango-bcreq/](projects/mango-bcreq/README.md) — витрина BCREQ (mango):
  промпты и стандарты подготовки спецификации бизнес-требований. Мастер — приватный
  репозиторий `G-Ivan-A/mango_ba_prompts`; витрина публикуется в изолированном
  разделе `/mango/` на зафиксированном коммите, страница описания —
  `/projects/mango-bcreq/`.

## Governance

- RFC: [governance/rfc/](governance/rfc/) — предложения к обсуждению.
  - [Product Vision & Concept (2026-06)](governance/rfc/portal-vision-concept-proposal-2026-06.md)

## Hybrid Team Operating Model

- Operating Model: [team/operating-model.md](team/operating-model.md)
- Task Modes: [team/task-modes.md](team/task-modes.md)
- Task Template: [team/task-template.md](team/task-template.md)

## Инфраструктура

- `.gitignore` — базовый Node.js/Next.js ignore-list.
- `src/.gitkeep` — placeholder для будущего кода.
- `package.json`, `scripts/` — сборка и проверка сайта (Node, без Jekyll):
  - `build-site.mjs` — собирает `_site/`: стартовая страница, `404.html`, брошюра,
    витрина в `mango/` и страница «О витрине»;
  - `check-site.mjs` — ссылки, изоляция разделов, приватность, кэш-параметры ресурсов;
  - `check-mango.mjs` — витрина в браузере: эталонный `site/` спицы и развёрнутая
    копия должны вести себя одинаково;
  - `run-spoke-scenarios.mjs` — Playwright-сценарии самой спицы на развёрнутой витрине;
  - `static-server.mjs` — локальный сервер с поведением GitHub Pages (`404.html`).
- `tests/` — `npm test`: конвейер витрины на публичной тестовой витрине, проверка
  доступа (ГК-2), стартовая страница и `404.html` в браузере.
- `.github/workflows/pages.yml` — единый workflow для pull request и `main`:
  проверка доступа к спице, загрузка `site/` по токену, сборка, `brochure.pdf`
  (Puppeteer), все проверки и, для `main`, публикация на GitHub Pages с проверкой
  опубликованной версии. В pull request без доступа к секрету сборка и проверки идут на
  тестовой витрине, публикации нет.

## Публикация сайта: однократная настройка

Владелец репозитория выполняет один раз, по порядку:

1. **Секрет `MANGO_SITE_TOKEN`.** Fine-grained personal access token: Resource owner —
   `G-Ivan-A`, Repository access — только `mango_ba_prompts`, Permissions — Contents:
   Read-only. Добавить в Settings → Secrets and variables → Actions → New repository
   secret. Без секрета или с отозванным токеном сборка `main` останавливается с причиной
   (ГК-2), ничего не публикуется.
2. **Источник Pages.** Settings → Pages → Build and deployment → Source:
   **GitHub Actions** (вместо «Deploy from a branch»). Пока источник — ветка, workflow
   не публикует и сообщает об этом ошибкой.
3. **Публикация.** Слияние в `main` или Actions → «Pages» → Run workflow.
   После публикации workflow сверяет `mango/deploy.json` с ожидаемыми версией и
   коммитом и проверяет коды ответа основных адресов.

Срок действия токена ограничен: перед истечением выпустить новый и заменить значение
секрета. Обновление версии витрины — см. [projects/mango-bcreq/README.md](projects/mango-bcreq/README.md#переход-на-новую-версию-спицы).

### Локально

```sh
npm ci
npm run build -- --mango-source <путь к site/ спицы> --base-path /open-ai.ru/
npm run check -- --site _site --base /open-ai.ru/
npm test
npm run serve -- --base /open-ai.ru/   # http://127.0.0.1:8137/open-ai.ru/
```

Брошюре нужны свои зависимости: `cd projects/ai-team-management-program && npm ci`.

---
**Версия:** 0.1  
**Дата:** 2026-06-07  
**Статус:** Draft
