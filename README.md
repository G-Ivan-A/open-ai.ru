# open-ai.ru

**AI-Native Production Portal Platform**

Официальный репозиторий разработки production-ready портала с личным кабинетом с использованием управляемой AI-assisted разработки.

---

## 🎯 О проекте

Мы создаём **не просто портал**, а воспроизводимую систему управляемой AI-assisted разработки сложных веб-приложений.

**Главная ценность** — в методологии:
- Human сохраняет полный контроль над архитектурой и требованиями
- AI-агенты работают эффективно внутри чётких контрактов
- Все решения traceable и могут быть использованы для обучения

---

## 📂 Структура проекта

| Репозиторий | Назначение | Статус |
|-------------|----------|--------|
| **[open-ai.ru](https://github.com/G-Ivan-A/open-ai.ru)** (текущий) | Production-код, архитектура, governance | **Active** |
| **[research-and-edu-ai-lab](https://github.com/G-Ivan-A/research-and-edu-ai-lab)** | Исследования, уроки, методология | Active |

---

## 🛠 Основные принципы

- **Governance-First** — правила и архитектура определяются до кода
- **Controlled AI-Assisted Development**
- **Dual Mode**: Structured Mode и Creative Mode
- **Human Review** обязателен для важных изменений

---

## 📋 Как создавать задачи

В проекте используются два шаблона:
- **Foundation / Governance** — инфраструктура, архитектура, правила
- **Feature** — разработка функционала портала

Подробные шаблоны находятся в [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE/).

---

## 📁 Ключевые документы

- [`AI_GOVERNANCE.md`](AI_GOVERNANCE.md) — главный контракт для AI-агентов
- [`AI_QUICK_REF.md`](AI_QUICK_REF.md) — шпаргалка для AI
- [`PRODUCT_VISION.md`](PRODUCT_VISION.md) — видение продукта
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — правила участия
- [`ROADMAP.md`](ROADMAP.md) — план развития

---

## 🏗 Технологический стек

- **Frontend**: Next.js (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui + Radix
- **State**: Zustand / TanStack
- **AI Tools**: Cursor, Claude, Codex, Qwen
- **Governance**: ADR, Contracts, AI Rules

---

## 🚀 Быстрый старт

```bash
git clone https://github.com/G-Ivan-A/open-ai.ru.git
cd open-ai.ru
cp .env.example .env.local
```

Далее ознакомьтесь с:
1. `AI_GOVERNANCE.md`
2. `AI_QUICK_REF.md`
3. `CONTRIBUTING.md`

---

**Проект находится на этапе Foundation & Governance Setup (Май 2026).**

**Автор:** Иван Гулиенко (Founder & PO)  
**Поддержка:** Команда G
