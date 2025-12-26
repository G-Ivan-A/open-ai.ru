# Applications

Эта директория содержит основные приложения проекта Open-AI.ru.

## Структура

### frontend/
Next.js приложение - клиентская часть портала.

**Технологии:**
- Next.js 14+ с App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand + React Query

**Запуск:**
```bash
cd frontend
npm install
npm run dev
```

Доступно на http://localhost:3000

### backend/
NestJS API сервер - серверная часть портала.

**Технологии:**
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL + Redis

**Запуск:**
```bash
cd backend
npm install
npm run start:dev
```

Доступно на http://localhost:4000

### ai-chat/
Микросервис ИИ-чата (будет добавлен позже).

**Технологии:**
- NestJS
- WebSocket
- OpenAI / YandexGPT

## Разработка

Каждое приложение имеет свой `package.json` и может разрабатываться независимо.

### Общие зависимости

Используйте workspace для общих библиотек:
```bash
# Из корня проекта
npm install <package> -w apps/frontend
npm install <package> -w apps/backend
```

### Тестирование

```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && npm test
```

## Деплой

### Development
```bash
docker-compose up -d
```

### Production

**Frontend:** Vercel (автоматический деплой при push в main)

**Backend:** AWS/Yandex Cloud через Docker

См. Dockerfiles в каждой директории.
