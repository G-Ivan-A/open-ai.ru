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

- [projects/ai-team-management-program/](projects/ai-team-management-program/README.md) —
  цифровая брошюра корпоративной программы «ИИ в работе с командой»
  (Jekyll, GitHub Pages) и её PDF-версия `brochure.pdf`.

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
- `.github/workflows/pages.yml` — сборка брошюры
  `projects/ai-team-management-program/`, генерация `brochure.pdf` (Puppeteer)
  и публикация на GitHub Pages при push в `main`;
  `.github/workflows/pages-check.yml` — те же сборка и проверки в pull request.
- `_config.yml` и `index.html` в корне — сборка GitHub Pages: публикуется только
  сайт программы, корень <https://g-ivan-a.github.io/open-ai.ru/> временно
  перенаправляет на <https://g-ivan-a.github.io/open-ai.ru/projects/ai-team-management-program/>.

---
**Версия:** 0.1  
**Дата:** 2026-06-07  
**Статус:** Draft
