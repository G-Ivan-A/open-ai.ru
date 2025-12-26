# Shared Libraries

Общие библиотеки, используемые несколькими приложениями.

## Структура

### common/
Общие утилиты, хелперы, константы.

**Содержит:**
- Утилиты для работы с датами, строками
- Валидаторы
- Константы
- Типы общего назначения

### database/
Prisma схема и клиент для работы с БД.

**Содержит:**
- Prisma schema
- Миграции
- Database client
- Seed скрипты

### auth/
Модуль аутентификации и авторизации.

**Содержит:**
- JWT utilities
- Auth guards
- RBAC логика
- Стратегии аутентификации

## Использование

### Импорт в приложениях

```typescript
// В приложениях используйте path aliases
import { formatDate } from '@common/utils';
import { prisma } from '@database/client';
import { JwtAuthGuard } from '@auth/guards';
```

### Path Aliases

Настроены в `tsconfig.json`:
```json
{
  "paths": {
    "@common/*": ["libs/common/src/*"],
    "@database/*": ["libs/database/src/*"],
    "@auth/*": ["libs/auth/src/*"]
  }
}
```

## Разработка

### Добавление новой библиотеки

1. Создайте директорию в `libs/`
2. Добавьте `package.json`
3. Создайте структуру `src/`
4. Обновите path aliases в `tsconfig.json`

### Тестирование

```bash
# Каждая библиотека тестируется отдельно
cd libs/common && npm test
```

## Лучшие практики

- Держите библиотеки небольшими и фокусированными
- Избегайте циклических зависимостей
- Экспортируйте только публичный API
- Документируйте публичные функции с JSDoc
