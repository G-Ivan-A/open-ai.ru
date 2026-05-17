# Clarify Engine — Интеграция с экосистемой open-ai.ru

Clarify Engine предоставляет REST API, который позволяет другим решениям экосистемы использовать его как компонент для работы с базой знаний.

## REST API

Базовый URL: `http://clarify-engine:3000/api/v1`

### Аутентификация

```bash
# Получить токен
curl -X POST /api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{"email": "user@company.ru", "password": "secret"}'

# Использовать токен в запросах
curl -H "Authorization: Bearer <token>" /api/v1/query
```

### Основные эндпоинты

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/v1/query` | Задать вопрос с получением цитат |
| POST | `/api/v1/ingest` | Загрузить документы |
| GET | `/api/v1/collections` | Список коллекций документов |
| POST | `/api/v1/collections` | Создать коллекцию |
| DELETE | `/api/v1/documents/{id}` | Удалить документ |

### Пример запроса

```bash
curl -X POST http://clarify-engine:3000/api/v1/query \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Каков порядок подачи заявления на отпуск?",
    "collection": "hr-policies",
    "top_k": 5
  }'
```

### Пример ответа

```json
{
  "answer": "Для оформления отпуска необходимо подать заявление за 14 дней до его начала.",
  "citations": [
    {
      "text": "Работник обязан уведомить работодателя о намерении взять отпуск не позднее чем за 14 календарных дней.",
      "source": "HR-Policy-2024.pdf",
      "page": 12,
      "confidence": 0.94
    }
  ],
  "model": "gpt-4o-mini",
  "tokens_used": 342
}
```

---

## Примеры оркестрации

### Clarify Engine + Open WebUI

Open WebUI — популярный чат-интерфейс для локальных LLM. В связке с Clarify Engine он получает ответы с цитатами из вашей базы знаний.

```yaml
# docker-compose.yml
services:
  clarify:
    image: clarifyengine/clarify:latest
    environment:
      LLM_PROVIDER: ollama
      OLLAMA_BASE_URL: http://ollama:11434
    ports:
      - "3000:3000"

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    environment:
      OPENAI_API_BASE_URL: http://clarify:3000/api/v1/openai
      OPENAI_API_KEY: "clarify-passthrough"
    ports:
      - "8080:8080"

  ollama:
    image: ollama/ollama:latest
    volumes:
      - ollama_data:/root/.ollama
```

Open WebUI использует Clarify Engine как OpenAI-совместимый прокси — пользователи получают привычный интерфейс, а под капотом работает RAG с цитатами.

---

### Clarify Engine + Agentic Tools

Агентные системы (LangChain, AutoGen, CrewAI) могут использовать Clarify Engine как инструмент поиска по знаниям.

#### LangChain

```python
from langchain.tools import BaseTool
import requests

class ClarifySearchTool(BaseTool):
    name = "clarify_search"
    description = "Поиск по корпоративной базе знаний с цитатами"

    def _run(self, query: str) -> str:
        response = requests.post(
            "http://clarify-engine:3000/api/v1/query",
            headers={"Authorization": f"Bearer {CLARIFY_TOKEN}"},
            json={"question": query, "top_k": 3}
        )
        data = response.json()
        result = data["answer"]
        for citation in data["citations"]:
            result += f"\n[Источник: {citation['source']}, стр. {citation['page']}]"
        return result

# Использование в агенте
from langchain.agents import initialize_agent
tools = [ClarifySearchTool()]
agent = initialize_agent(tools, llm, agent="zero-shot-react-description")
agent.run("Какова политика компании по удалённой работе?")
```

#### AutoGen

```python
import autogen
import requests

def clarify_search(query: str) -> str:
    """Поиск по базе знаний компании."""
    resp = requests.post(
        "http://clarify-engine:3000/api/v1/query",
        headers={"Authorization": f"Bearer {CLARIFY_TOKEN}"},
        json={"question": query}
    )
    return resp.json()["answer"]

config_list = [{"model": "gpt-4o-mini", "api_key": OPENAI_KEY}]
assistant = autogen.AssistantAgent(
    name="hr_assistant",
    llm_config={"config_list": config_list},
    function_map={"clarify_search": clarify_search}
)
```

---

### Clarify Engine + CRM-система

Интеграция с популярными CRM для создания умного ассистента по работе с клиентами.

#### Webhook-интеграция

```python
# Пример FastAPI-обработчика для webhook от CRM
from fastapi import FastAPI, Request
import httpx

app = FastAPI()

@app.post("/crm-webhook")
async def handle_crm_query(request: Request):
    body = await request.json()
    customer_question = body["message"]
    customer_id = body["customer_id"]

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://clarify-engine:3000/api/v1/query",
            headers={"Authorization": f"Bearer {CLARIFY_TOKEN}"},
            json={
                "question": customer_question,
                "collection": "product-docs",
                "context": {"customer_id": customer_id}
            }
        )
    data = response.json()
    return {"reply": data["answer"], "citations": data["citations"]}
```

---

## Схема интеграции в экосистеме

```
┌─────────────────────────────────────────────────────────────┐
│                    Экосистема open-ai.ru                     │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │  Open WebUI  │    │ Agentic     │    │   CRM / ERP     │ │
│  │  (чат-UI)   │    │ Tools       │    │   Webhook       │ │
│  └──────┬──────┘    └──────┬──────┘    └────────┬────────┘ │
│         │                  │                     │          │
│         └──────────────────┼─────────────────────┘          │
│                            │                                │
│                    ┌───────▼────────┐                       │
│                    │ Clarify Engine │                       │
│                    │   REST API     │                       │
│                    └───────┬────────┘                       │
│                            │                                │
│             ┌──────────────┼──────────────┐                 │
│             │              │              │                 │
│     ┌───────▼──────┐ ┌─────▼──────┐ ┌────▼──────────┐     │
│     │  Векторная   │ │    LLM     │ │  Хранилище    │     │
│     │  база данных │ │  Provider  │ │  документов   │     │
│     │  (Qdrant)    │ │ (OpenAI /  │ │  (PDF, DOCX,  │     │
│     │              │ │ YandexGPT/ │ │   MD, HTML)   │     │
│     │              │ │  Ollama)   │ │               │     │
│     └──────────────┘ └────────────┘ └───────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## OpenAI-совместимый режим

Clarify Engine поддерживает OpenAI-совместимый API. Любое приложение, работающее с OpenAI, может переключиться на Clarify Engine, изменив только `base_url`:

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://clarify-engine:3000/api/v1/openai",
    api_key="clarify-passthrough"
)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Какова политика компании по отпускам?"}]
)
print(response.choices[0].message.content)
```

Ответы автоматически дополняются информацией из базы знаний, цитаты передаются в поле `citations` расширенного ответа.

## SDK и библиотеки

| Язык | Пакет | Установка |
|---|---|---|
| Python | `clarify-python` | `pip install clarify-python` |
| JavaScript | `@clarify/client` | `npm install @clarify/client` |
| Go | `clarify-go` | `go get github.com/clarify-engine/clarify-go` |
| PHP | `clarify/clarify-php` | `composer require clarify/clarify-php` |
