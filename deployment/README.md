# Deployment Templates — Шаблоны оркестрации

Готовые конфигурации для совместного запуска нескольких open-source решений в рамках единой экосистемы.

## Доступные стеки

| Шаблон | Уровень | Описание |
|--------|---------|----------|
| [starter-rag-stack](starter-rag-stack/) | Starter | Локальный чат с документами: Open WebUI + Ollama |
| [business-rag-stack](business-rag-stack/) | Business | Автоматизация запросов: AnythingLLM + Clarify Engine + n8n |
| [cloud-enterprise-stack](cloud-enterprise-stack/) | Cloud Enterprise | Продвинутая RAG с мониторингом: RAGFlow + Langfuse |

## Быстрый выбор стека

```
Ноутбук / рабочий ПК без GPU → starter-rag-stack
Корпоративный сервер          → business-rag-stack
Облако, масштаб               → cloud-enterprise-stack
```

## Как использовать

```bash
# Выбрать нужный стек
cd deployment/starter-rag-stack

# Скопировать и настроить переменные
cp .env.example .env

# Запустить
docker compose up -d
```
