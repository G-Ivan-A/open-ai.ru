# AI Agent Sandbox | Open-AI.ru

Безопасная изолированная среда для запуска и тестирования ИИ-агентов на портале Open-AI.ru.

## 📝 Обзор

AI Agent Sandbox предоставляет Docker-based платформу для безопасного выполнения ИИ-агентов с полной изоляцией, ограничениями ресурсов и комплексными мерами безопасности.

### Ключевые возможности

- ✅ **Docker-контейнеризация** - изоляция процессов и сети
- ✅ **Ограничение ресурсов** - CPU, RAM, время выполнения
- ✅ **Rate Limiting** - защита от DoS атак
- ✅ **Безопасное хранилище** - временные данные внутри контейнера
- ✅ **REST API** - управление сессиями и выполнение агентов
- ✅ **Веб-интерфейс** - интуитивный UI для взаимодействия
- ✅ **Демо-агент** - анализ текста (sentiment, keywords, summarization)

## 🏗️ Архитектура

```
sandbox/
├── backend/          # Node.js API сервер
│   ├── src/
│   │   ├── routes/       # API маршруты
│   │   ├── controllers/  # Контроллеры
│   │   ├── services/     # Бизнес-логика (Docker управление)
│   │   ├── middleware/   # Rate limiting, validation, error handling
│   │   └── utils/        # Вспомогательные функции
│   └── package.json
├── frontend/         # React веб-интерфейс
│   ├── src/
│   │   ├── components/   # React компоненты
│   │   ├── services/     # API клиент
│   │   └── styles/       # CSS стили
│   └── package.json
├── docker/           # Docker конфигурации
│   ├── Dockerfile
│   └── docker-compose.yml
├── agents/           # ИИ-агенты
│   ├── agent.sh          # Wrapper скрипт
│   └── text-analysis/    # Демо агент анализа текста
└── docs/             # Документация
```

## 🚀 Быстрый старт

### Требования

- Node.js 18+
- Docker и Docker Compose
- Redis (опционально, для distributed rate limiting)

### Установка

1. **Клонирование репозитория**
```bash
git clone https://github.com/G-Ivan-A/open-ai.ru.git
cd open-ai.ru/sandbox
```

2. **Сборка Docker образа агента**
```bash
cd docker
docker build -t open-ai-ru/sandbox-agent:latest -f Dockerfile ../
cd ..
```

3. **Настройка Backend**
```bash
cd backend
cp .env.example .env
npm install
```

4. **Настройка Frontend**
```bash
cd ../frontend
npm install
```

### Запуск в режиме разработки

**Вариант 1: С Docker Compose (рекомендуется)**

```bash
cd docker
docker-compose up
```

Сервисы будут доступны по адресам:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Redis: localhost:6379

**Вариант 2: Локальный запуск**

Терминал 1 - Backend:
```bash
cd backend
npm run dev
```

Терминал 2 - Frontend:
```bash
cd frontend
npm run dev
```

## 📚 API Документация

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### 1. Создание сессии

**POST** `/sessions`

Создает новую изолированную сессию песочницы.

**Request:**
```json
{
  "agentType": "text-analysis",
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "agentType": "text-analysis",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "expiresIn": 300000
  }
}
```

#### 2. Получение информации о сессии

**GET** `/sessions/:sessionId`

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "...",
    "agentType": "text-analysis",
    "status": "active",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

#### 3. Выполнение агента

**POST** `/agents/:sessionId/execute`

Выполняет агент в изолированной сессии.

**Request:**
```json
{
  "input": "Open-AI.ru - отличная платформа для малого бизнеса...",
  "options": {
    "sentiment": true,
    "keywords": true,
    "summary": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "...",
    "result": {
      "text_length": 150,
      "word_count": 25,
      "sentence_count": 3,
      "sentiment": {
        "score": 0.15,
        "label": "positive",
        "confidence": 0.8
      },
      "keywords": [
        {"keyword": "платформа", "frequency": 2, "relevance": 0.08}
      ],
      "summary": {
        "summary": "...",
        "compression_ratio": 0.6
      }
    },
    "executedAt": "2025-01-15T10:31:00.000Z"
  }
}
```

#### 4. Удаление сессии

**DELETE** `/sessions/:sessionId`

**Response:**
```json
{
  "success": true,
  "message": "Session destroyed successfully"
}
```

#### 5. Список активных сессий

**GET** `/sessions`

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [...],
    "count": 3
  }
}
```

### Rate Limiting

API защищен rate limiting:
- **100 запросов** в течение **15 минут** на IP-адрес
- HTTP 429 при превышении лимита
- Заголовки: `RateLimit-Limit`, `RateLimit-Remaining`, `Retry-After`

## 🔒 Безопасность

### Реализованные меры

1. **Контейнерная изоляция**
   - Запуск от непривилегированного пользователя (`sandbox`)
   - `no-new-privileges` security option
   - Полное удаление capabilities (`CapDrop: ALL`)
   - Изоляция сети (`NetworkMode: none`)

2. **Ограничение ресурсов**
   - Память: 512MB (configurable)
   - CPU: 1 core (configurable)
   - Максимум процессов: 100
   - Timeout выполнения: 60 секунд

3. **Защита от атак**
   - Rate limiting на уровне API
   - Валидация всех входных данных (Joi)
   - Автоматическое завершение долгих процессов
   - Максимум concurrent сессий: 10

4. **Логирование**
   - Все действия логируются с помощью Winston
   - Подозрительная активность отслеживается
   - Централизованное хранилище логов

### Best Practices

Реализация следует рекомендациям 2025:
- Docker Sandboxes (источник: [Docker Blog](https://www.docker.com/blog/docker-sandboxes-a-new-approach-for-coding-agent-safety/))
- Runtime Security для AI Agents (источник: [Docker AI Security](https://www.docker.com/blog/secure-ai-agents-runtime-security/))
- Minimal base images (Alpine Linux)
- Non-root user execution
- gVisor-ready architecture

## 🧪 Тестирование

### Unit тесты

```bash
cd backend
npm test
```

### Integration тесты

```bash
npm run test:integration
```

### E2E тесты

```bash
cd frontend
npm run test:e2e
```

## 📊 Мониторинг

### Health Check

```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "service": "sandbox-backend",
  "version": "0.1.0"
}
```

### Логи

Backend логи находятся в `backend/logs/`:
- `combined.log` - все логи
- `error.log` - только ошибки

## 🛠️ Разработка

### Добавление нового агента

1. Создайте директорию в `agents/`
```bash
mkdir agents/my-agent
```

2. Создайте скрипт агента
```python
# agents/my-agent/agent.py
import sys
import json

def main():
    input_text = sys.stdin.read()
    # Ваша логика
    result = {"output": "..."}
    print(json.dumps(result))

if __name__ == '__main__':
    main()
```

3. Обновите `agents/agent.sh`
```bash
case "$AGENT_TYPE" in
    "my-agent")
        echo "$INPUT_TEXT" | python3 /app/my-agent/agent.py "$OPTIONS"
        ;;
esac
```

4. Пересоберите Docker образ
```bash
cd docker
docker build -t open-ai-ru/sandbox-agent:latest -f Dockerfile ../
```

### Структура проекта

См. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) для детальной архитектурной документации.

## 🤝 Вклад в проект

Мы приветствуем вклад в проект! См. [CONTRIBUTING.md](../CONTRIBUTING.md) для инструкций.

### Разработка

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📝 Лицензия

MIT License - см. [LICENSE](../LICENSE)

## 📮 Контакты

- **GitHub Issues**: [https://github.com/G-Ivan-A/open-ai.ru/issues](https://github.com/G-Ivan-A/open-ai.ru/issues)
- **Email**: info@open-ai.ru
- **Telegram**: @openai_ru

## 🙏 Благодарности

Проект использует современные best practices для безопасного запуска AI агентов:
- [Docker Sandboxes](https://www.docker.com/blog/docker-sandboxes-a-new-approach-for-coding-agent-safety/)
- [E2B Cloud Sandboxes](https://www.docker.com/blog/docker-e2b-building-the-future-of-trusted-ai/)
- [MDN API Security Guide](https://developer.mozilla.org/en-US/blog/securing-apis-express-rate-limit-and-slow-down/)
- [express-rate-limit](https://www.npmjs.com/package/express-rate-limit)
