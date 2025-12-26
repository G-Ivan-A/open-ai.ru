# Архитектура AI Agent Sandbox

## Обзор системы

AI Agent Sandbox - это многоуровневая система для безопасного выполнения ИИ-агентов с использованием Docker-контейнеризации и REST API.

## Компоненты системы

### 1. Backend API Server (Node.js/Express)

**Назначение**: Управление сессиями песочницы и выполнение агентов

**Технологии**:
- Express.js - веб-фреймворк
- Dockerode - управление Docker контейнерами
- Winston - логирование
- Joi - валидация данных
- express-rate-limit - защита от DoS

**Структура**:
```
backend/
├── src/
│   ├── index.js              # Точка входа приложения
│   ├── routes/               # API маршруты
│   │   ├── session.js        # CRUD для сессий
│   │   └── agent.js          # Выполнение агентов
│   ├── controllers/          # Обработчики запросов
│   │   ├── sessionController.js
│   │   └── agentController.js
│   ├── services/
│   │   └── dockerService.js  # Управление Docker контейнерами
│   ├── middleware/
│   │   ├── rateLimiter.js    # Rate limiting
│   │   ├── errorHandler.js   # Обработка ошибок
│   │   └── validation.js     # Валидация данных
│   └── utils/
│       └── logger.js          # Winston logger
└── config/
    └── .env                   # Конфигурация
```

### 2. Frontend UI (React + Vite)

**Назначение**: Веб-интерфейс для взаимодействия с агентами

**Технологии**:
- React 18 - UI библиотека
- Vite - build tool
- Axios - HTTP клиент

**Компоненты**:
- `SandboxInterface` - главный контейнер
- `SessionInfo` - информация о сессии
- `AgentInput` - форма ввода
- `AgentOutput` - отображение результатов
- `Header` - навигация

### 3. Docker Container Runtime

**Назначение**: Изолированная среда выполнения агентов

**Базовый образ**: `node:18-alpine`

**Security features**:
- Non-root user (`sandbox:1001`)
- No capabilities (`CapDrop: ALL`)
- Network isolation (`NetworkMode: none`)
- Memory limit (512MB default)
- CPU limit (1 core default)
- PID limit (100 processes)
- Auto-remove on stop

**Структура контейнера**:
```
/app/
├── agent.sh                 # Entry point wrapper
├── text-analysis/
│   ├── agent.py             # Python агент
│   └── requirements.txt
└── [future agents]/
```

### 4. AI Agents

**Текущие агенты**:

#### Text Analysis Agent (Python)

**Возможности**:
- Sentiment analysis (анализ тональности)
- Keyword extraction (извлечение ключевых слов)
- Text summarization (суммаризация)

**Технологии**:
- Python 3 standard library
- Без внешних зависимостей (для простоты demo)

**Входные данные**:
```json
{
  "input": "текст для анализа",
  "options": {
    "sentiment": true,
    "keywords": true,
    "summary": true
  }
}
```

**Выходные данные**:
```json
{
  "text_length": 150,
  "word_count": 25,
  "sentiment": {...},
  "keywords": [...],
  "summary": {...}
}
```

## Потоки данных

### 1. Создание сессии

```
User → Frontend → Backend API → DockerService
                                      ↓
                                Docker Daemon
                                      ↓
                                Create Container
                                      ↓
                                Start Container
                                      ↓
Backend ← DockerService ← Session Info
   ↓
Frontend ← Response
   ↓
User (Session ID)
```

### 2. Выполнение агента

```
User (Input) → Frontend → Backend API
                              ↓
                         Validate Input
                              ↓
                         DockerService
                              ↓
                    container.exec(command)
                              ↓
                      Agent Process
                              ↓
                    Output (stdout/stderr)
                              ↓
                    Parse & Return Result
                              ↓
Frontend ← Response ← Backend API
   ↓
User (Results)
```

### 3. Автоматическая очистка

```
Session Created
   ↓
setTimeout(TIMEOUT)
   ↓
Time Expires
   ↓
DockerService.destroySession()
   ↓
container.stop()
   ↓
container.remove()
   ↓
Session Deleted from Map
```

## Безопасность

### Defense in Depth

**Layer 1: Network Security**
- CORS настройка
- Helmet.js security headers
- Rate limiting

**Layer 2: Input Validation**
- Joi схемы валидации
- Максимальная длина текста (10000 chars)
- Sanitization входных данных

**Layer 3: Container Isolation**
- Non-root user
- No network access
- No host volume mounts
- Dropped capabilities
- Resource limits

**Layer 4: Process Isolation**
- Separate container per session
- Timeout на выполнение
- PID limits
- Auto-cleanup

**Layer 5: Monitoring & Logging**
- Winston structured logging
- Error tracking
- Suspicious activity logging
- Rate limit violations

### Threat Model

**Защита от**:

1. **DoS атаки**
   - Rate limiting (100 req/15min per IP)
   - Max concurrent sessions (10)
   - Execution timeouts (60s)
   - Memory limits (512MB)

2. **Container escape**
   - Non-root user
   - No capabilities
   - Read-only root filesystem option
   - Network isolation

3. **Resource exhaustion**
   - CPU limits (1 core)
   - Memory limits (512MB)
   - Process limits (100)
   - Timeout enforcement

4. **Data exfiltration**
   - No network access
   - No volume mounts
   - Isolated temp storage
   - Auto-cleanup

## Масштабируемость

### Horizontal Scaling

**Backend API**:
- Stateless design
- Redis для distributed rate limiting
- Load balancer (nginx/haproxy)

**Docker Hosts**:
- Multiple Docker daemons
- Container orchestration (Kubernetes)
- Resource pooling

### Vertical Scaling

**Resource Limits**:
```env
CONTAINER_MEMORY_LIMIT=512m  # можно увеличить
CONTAINER_CPU_LIMIT=1        # можно увеличить
MAX_CONCURRENT_SESSIONS=10   # можно увеличить
```

## Мониторинг

### Metrics

**System Metrics**:
- CPU usage per container
- Memory usage per container
- Active sessions count
- Requests per second

**Business Metrics**:
- Session creation rate
- Agent execution time
- Success/failure ratio
- Rate limit violations

### Logging

**Log Levels**:
- ERROR: Критические ошибки
- WARN: Rate limit, suspicious activity
- INFO: Session lifecycle, executions
- DEBUG: Detailed debugging info

**Log Format** (JSON):
```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Session created: abc123",
  "service": "sandbox-backend",
  "sessionId": "abc123",
  "ip": "192.168.1.1"
}
```

## Production Deployment

### Рекомендуемая конфигурация

**Hardware**:
- CPU: 8+ cores
- RAM: 16GB+
- Disk: SSD 100GB+

**Software**:
- Docker 24+
- Node.js 18+
- Redis 7+
- Nginx (reverse proxy)

**Security**:
- HTTPS (Let's Encrypt)
- Firewall rules
- Regular security updates
- Container image scanning

### Environment Variables

```env
# Production
NODE_ENV=production
PORT=3001
REDIS_HOST=redis.prod.local
DOCKER_SOCKET=/var/run/docker.sock
RATE_LIMIT_MAX_REQUESTS=100
SESSION_TIMEOUT_MS=300000
CONTAINER_MEMORY_LIMIT=512m
CONTAINER_CPU_LIMIT=1
MAX_CONCURRENT_SESSIONS=50
LOG_LEVEL=info
```

## Future Enhancements

### Планируемые улучшения

1. **Advanced Security**
   - gVisor runtime
   - Kata Containers support
   - Network policies
   - Audit logging

2. **More Agents**
   - Code execution agents
   - Data analysis agents
   - ML inference agents
   - Custom agent SDK

3. **Enhanced Monitoring**
   - Prometheus metrics
   - Grafana dashboards
   - Alert management
   - Distributed tracing

4. **User Features**
   - Authentication/Authorization
   - User quotas
   - Session persistence
   - Webhook notifications

5. **Performance**
   - Container pooling
   - Warm startup optimization
   - Caching layer
   - CDN for frontend
