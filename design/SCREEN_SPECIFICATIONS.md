# Screen Specifications: Open-AI.ru Portal

Детальные спецификации для всех 4 ключевых экранов портала.

---

## 🏠 Screen 1: Главная страница (Home Page)

### Общие параметры
- **URL**: `/` или `/home`
- **Роли**: Guest (неавторизован), Authenticated (авторизован)
- **Цель**: First impression, ценностное предложение, быстрый старт

---

### Desktop Layout (1440px)

#### Структура экрана

```
┌─────────────────────────────────────────────────────────────┐
│ Top Navigation Bar (64px height)                            │
├──────────────┬──────────────────────────────────────────────┤
│              │                                               │
│  AI          │  Main Content Area                            │
│  Assistant   │                                               │
│  Slot        │  ┌─────────────────────────────────────────┐ │
│              │  │ Hero Section                             │ │
│  (360px      │  │ - H1: Headline                           │ │
│   fixed)     │  │ - Subheadline                            │ │
│              │  │ - CTA Buttons                            │ │
│              │  │ - Visual/Illustration                    │ │
│              │  └─────────────────────────────────────────┘ │
│              │                                               │
│              │  ┌─────────────────────────────────────────┐ │
│              │  │ Key Features Section (6 cards)           │ │
│              │  │ ┌─────┐ ┌─────┐ ┌─────┐                 │ │
│              │  │ │Card1│ │Card2│ │Card3│                 │ │
│              │  │ └─────┘ └─────┘ └─────┘                 │ │
│              │  │ ┌─────┐ ┌─────┐ ┌─────┐                 │ │
│              │  │ │Card4│ │Card5│ │Card6│                 │ │
│              │  │ └─────┘ └─────┘ └─────┘                 │ │
│              │  └─────────────────────────────────────────┘ │
│              │                                               │
│              │  ┌─────────────────────────────────────────┐ │
│              │  │ Starting Sections (2 previews)           │ │
│              │  │ ┌──────────────┐ ┌──────────────┐        │ │
│              │  │ │ ИИ-агенты    │ │ Репутационные│        │ │
│              │  │ │ для МСП      │ │ технологии   │        │ │
│              │  │ └──────────────┘ └──────────────┘        │ │
│              │  └─────────────────────────────────────────┘ │
│              │                                               │
│              │  ┌─────────────────────────────────────────┐ │
│              │  │ CTA Section                              │ │
│              │  │ "Начните сейчас" + Role buttons          │ │
│              │  └─────────────────────────────────────────┘ │
│              │                                               │
├──────────────┴───────────────────────────────────────────────┤
│ Footer                                                        │
└───────────────────────────────────────────────────────────────┘
```

---

#### Компоненты детально

##### 1. Top Navigation (Guest View)
```
Height: 64px
Background: White
Border-bottom: 1px solid Gray 200

Left Section:
├── Logo (32px height)
├── Spacing: 24px
└── Nav Links:
    ├── "Решения" (link to /solutions)
    ├── "Специалисты" (link to /experts)
    └── "Обучение" (link to /learning)

Right Section:
├── Search Icon (24px)
├── Spacing: 16px
├── "Войти" (text button)
├── Spacing: 12px
└── "Зарегистрироваться" (primary button, medium)
```

##### 2. AI Assistant Slot (Left Sidebar)
```
Width: 360px (fixed)
Background: White
Border-right: 1px solid Gray 200
Height: calc(100vh - 64px)
Position: sticky, top: 64px

Header:
├── Title: "Навигационный ассистент"
├── Icon: sparkles (24px)
└── Collapse button (optional)

Content Area:
├── Welcome message
├── Suggested queries (pills):
│   ├── "Найти решение для автоматизации"
│   ├── "Как зарегистрироваться?"
│   └── "Что такое репутационные технологии?"
└── Chat history (if any)

Input Area (sticky bottom):
├── Text input field
├── Placeholder: "Задайте вопрос..."
└── Send button
```

##### 3. Hero Section
```
Padding: 64px 48px
Background: White (или subtle gradient)
Max-width: 960px
Text-align: center (centered in container)

H1 Headline:
├── Text: "Открытая платформа для open-source решений"
├── Font: 48px, Bold (700)
├── Color: Gray 900
├── Line-height: 56px
└── Max-width: 800px

Subheadline:
├── Text: "Соединяем разработчиков ИИ-решений с малым и средним бизнесом"
├── Font: 20px, Regular (400)
├── Color: Gray 600
├── Line-height: 32px
├── Max-width: 700px
└── Margin-top: 16px

CTA Buttons:
├── Margin-top: 32px
├── Display: flex, gap: 16px, justify-center
├── Primary Button: "Начать работу"
└── Secondary Button: "Посмотреть решения"

Visual/Illustration:
├── Margin-top: 48px
├── Width: 100%
├── Max-width: 800px
└── [Иллюстрация концепции платформы]
```

##### 4. Key Features Section
```
Padding: 64px 48px
Background: Gray 50
Max-width: 1200px

Section Header:
├── H2: "Ключевые преимущества"
├── Font: 36px, Bold
├── Color: Gray 900
└── Margin-bottom: 48px

Cards Grid:
├── Display: grid
├── Columns: 3 (desktop)
├── Gap: 24px
└── Cards (6 total):

Card Structure:
├── Background: White
├── Border: 1px solid Gray 200
├── Border-radius: 12px
├── Padding: 24px
├── Min-height: 200px
├── Hover: shadow increase
└── Content:
    ├── Icon (48px, Primary 600)
    ├── Margin-bottom: 16px
    ├── Title (H5, 20px, Medium)
    ├── Margin-bottom: 8px
    └── Description (Body Small, 14px)

6 Cards Content:
1. "Фокус на open-source"
   - Icon: code
   - Description: "Приоритет открытым решениям..."

2. "Без социальных метрик"
   - Icon: shield-check
   - Description: "Оценка решений, а не людей..."

3. "Прозрачность ИИ"
   - Icon: lightbulb
   - Description: "Понимание работы алгоритмов..."

4. "Архитектура независимости"
   - Icon: cube-transparent
   - Description: "Отказоустойчивость компонентов..."

5. "Практическая польза"
   - Icon: chart-bar
   - Description: "Измеримые результаты..."

6. "Защита от спама"
   - Icon: lock-closed
   - Description: "Модерация через ИИ-агентов..."
```

##### 5. Starting Sections Preview
```
Padding: 64px 48px
Background: White
Max-width: 1200px

Section Header:
├── H2: "Стартовые разделы"
├── Font: 36px, Bold
└── Margin-bottom: 48px

Previews Grid:
├── Display: grid
├── Columns: 2
├── Gap: 32px
└── Cards (2 total):

Preview Card Structure:
├── Background: White
├── Border: 1px solid Gray 200
├── Border-radius: 12px
├── Padding: 32px
├── Hover: shadow increase
└── Content:
    ├── Category Badge ("ИИ-агенты" / "Репутация")
    ├── Margin-bottom: 16px
    ├── Title (H3, 30px, SemiBold)
    ├── Margin-bottom: 16px
    ├── Description (Body, 16px)
    ├── Margin-bottom: 24px
    ├── Preview Image/Visual
    ├── Margin-bottom: 24px
    └── CTA Link: "Узнать больше →"

Card 1: ИИ-агенты для создания порталов МСП
Card 2: Репутационные технологии
```

##### 6. CTA Section
```
Padding: 64px 48px
Background: Primary gradient (subtle)
Text-align: center

H2:
├── Text: "Готовы начать?"
├── Font: 36px, Bold
├── Color: White or Gray 900
└── Margin-bottom: 16px

Description:
├── Font: 18px, Regular
├── Color: White or Gray 600
└── Margin-bottom: 32px

Role Buttons:
├── Display: flex, gap: 16px, justify-center
├── 3 buttons:
│   ├── "Я стартап"
│   ├── "Я специалист"
│   └── "Я представитель МСП"
└── Each button:
    ├── Size: Large
    ├── Icon: relevant icon (rocket, user, building)
    └── Links to registration with pre-selected role
```

##### 7. Footer
```
Background: Gray 900
Color: Gray 300
Padding: 48px 48px 24px

Structure:
├── Top Section:
│   ├── Columns: 4 (Logo + 3 link columns)
│   ├── Gap: 48px
│   └── Content:
│       ├── Column 1: Logo + Description
│       ├── Column 2: "Разделы" (links)
│       ├── Column 3: "Ресурсы" (links)
│       └── Column 4: "Контакты" (links)
│
└── Bottom Section:
    ├── Border-top: 1px solid Gray 800
    ├── Padding-top: 24px
    ├── Display: flex, justify-between
    ├── Left: "© 2025 Open-AI.ru"
    └── Right: Social links (GitHub, Telegram, etc.)
```

---

### Authenticated View (Персонализированный дашборд)

Отличия от Guest View:

```
Top Navigation:
├── Right Section заменен на:
│   ├── Notifications bell (icon with badge)
│   ├── User avatar + dropdown menu
│   └── Items in dropdown:
│       ├── "Профиль"
│       ├── "Мои проекты"
│       ├── "Настройки"
│       └── "Выйти"

Main Content вместо Hero:
├── Welcome Section:
│   ├── "Добро пожаловать, [Имя]!"
│   ├── Quick stats (если применимо)
│   └── Contextual CTA based on role
│
├── Recent Activity:
│   ├── H3: "Последняя активность"
│   └── List of recent items (projects, solutions, etc.)
│
├── Recommended Solutions:
│   ├── H3: "Рекомендации для вас"
│   └── Grid of solution cards (personalized)
│
└── Quick Actions:
    ├── H3: "Быстрые действия"
    └── Buttons/cards for common tasks
```

---

### Tablet Layout (768px)

Изменения:
```
AI Assistant Slot:
├── Not visible by default
├── Opens as drawer from left
└── Toggle button in top nav

Main Content:
├── Full width (minus padding)
├── Key Features: 2 columns (instead of 3)
├── Starting Sections: stacked (1 column)
└── Reduced padding: 32px

Footer:
└── 2 columns instead of 4
```

---

### Mobile Layout (375px)

Изменения:
```
Top Navigation:
├── Hamburger menu (left)
├── Logo (center)
└── User icon or "Войти" (right)

AI Assistant:
├── Opens as bottom sheet or full modal
└── Trigger: floating button (bottom-right corner)

Main Content:
├── Padding: 16px
├── Hero H1: 36px (smaller)
├── Key Features: 1 column
├── Starting Sections: 1 column
├── CTA Buttons: stacked (full-width)
└── All sections simplified

Footer:
├── 1 column
└── Links accordion (optional)
```

---

## 📁 Screen 2: Каталог решений (Solutions Catalog)

### Общие параметры
- **URL**: `/solutions`
- **Роли**: All (с разным уровнем доступа)
- **Цель**: Просмотр, поиск, фильтрация решений

---

### Desktop Layout (1440px)

#### Структура экрана

```
┌─────────────────────────────────────────────────────────────┐
│ Top Navigation Bar (64px height)                            │
├──────────────┬──────────────────────────────────────────────┤
│              │                                               │
│  AI          │  Catalog Header                               │
│  Assistant   │  ┌─────────────────────────────────────────┐ │
│  Slot        │  │ H1: "Каталог решений"                    │ │
│              │  │ Description                               │ │
│  (360px      │  └─────────────────────────────────────────┘ │
│   fixed)     │                                               │
│              │  ┌─────────────────────────────────────────┐ │
│              │  │ Search Bar (full-width)                  │ │
│              │  └─────────────────────────────────────────┘ │
│              │                                               │
│              │  ┌────────────┬────────────────────────────┐ │
│              │  │ Filters    │  Solutions Grid             │ │
│              │  │ Panel      │                             │ │
│              │  │            │  ┌────┐ ┌────┐ ┌────┐      │ │
│              │  │ Industry   │  │Sol1│ │Sol2│ │Sol3│      │ │
│              │  │ Task Type  │  └────┘ └────┘ └────┘      │ │
│              │  │ Technology │                             │ │
│              │  │ Solution   │  ┌────┐ ┌────┐ ┌────┐      │ │
│              │  │ Type       │  │Sol4│ │Sol5│ │Sol6│      │ │
│              │  │            │  └────┘ └────┘ └────┘      │ │
│              │  │ Sort       │                             │ │
│              │  │            │  ┌────┐ ┌────┐ ┌────┐      │ │
│              │  │            │  │Sol7│ │Sol8│ │Sol9│      │ │
│              │  │            │  └────┘ └────┘ └────┘      │ │
│              │  │            │                             │ │
│              │  └────────────┴────────────────────────────┘ │
│              │                                               │
│              │  ┌─────────────────────────────────────────┐ │
│              │  │ Pagination                               │ │
│              │  └─────────────────────────────────────────┘ │
│              │                                               │
├──────────────┴───────────────────────────────────────────────┤
│ Footer                                                        │
└───────────────────────────────────────────────────────────────┘
```

---

#### Компоненты детально

##### 1. Catalog Header
```
Padding: 32px 48px
Background: White
Border-bottom: 1px solid Gray 200

H1:
├── Text: "Каталог решений"
├── Font: 36px, Bold
├── Color: Gray 900
└── Margin-bottom: 12px

Description:
├── Font: 18px, Regular
├── Color: Gray 600
├── Max-width: 800px
└── Text: "Открытые решения для автоматизации бизнеса"
```

##### 2. Search Bar
```
Padding: 24px 48px
Background: White

Structure:
├── Width: 100%
├── Max-width: 800px
├── Margin: 0 auto
└── Input:
    ├── Height: 52px (large)
    ├── Border: 2px solid Gray 300
    ├── Border-radius: 12px
    ├── Padding: 16px 48px 16px 20px
    ├── Font: 16px
    ├── Placeholder: "Поиск решений..."
    ├── Icon (left): search (24px, Gray 400)
    ├── Button (right): "Искать" (primary, medium)
    └── Focus: border Primary 500, shadow
```

##### 3. Filters Panel
```
Width: 280px
Background: White
Border-right: 1px solid Gray 200
Padding: 24px
Position: sticky, top: 64px

Structure:

H5: "Фильтры"
├── Font: 18px, SemiBold
├── Margin-bottom: 20px
└── Clear all link (right)

Filter Groups:
├── Margin-bottom: 24px each
└── Each group:
    ├── Label (14px, Medium, Gray 900)
    ├── Margin-bottom: 12px
    └── Options (checkboxes or pills):
        ├── Spacing: 8px
        └── Checkbox + Label

Filter 1: Отрасль
├── Производство
├── Торговля
├── Услуги
├── IT и технологии
└── Другое

Filter 2: Тип задачи
├── Автоматизация процессов
├── Аналитика
├── CRM
├── Маркетинг
└── Другое

Filter 3: Технология
├── ИИ-агенты
├── Machine Learning
├── NLP
├── Computer Vision
└── Другое

Filter 4: Тип решения
├── Open-source
├── Freemium
└── Premium

Filter 5: Сортировка (dropdown)
├── По релевантности
├── Новые
├── Популярные (по внедрениям)
└── По отрасли

Apply Filters Button:
├── Primary button, full-width
└── Text: "Применить"
```

##### 4. Solutions Grid
```
Padding: 24px 48px
Background: Gray 50
Flex-grow: 1

Grid:
├── Display: grid
├── Columns: 3 (desktop 1440px)
├── Gap: 24px
└── Solution Cards

Results Info:
├── Margin-bottom: 20px
├── Font: 14px, Regular, Gray 600
└── Text: "Найдено: 42 решения"
```

##### 5. Solution Card
```
Background: White
Border: 1px solid Gray 200
Border-radius: 12px
Overflow: hidden
Transition: all 0.2s
Height: 100% (fit content, but min-height for consistency)

Hover State:
├── Transform: translateY(-4px)
├── Box-shadow: 0 8px 16px rgba(0,0,0,0.1)
└── Border-color: Gray 300

Structure:

1. Thumbnail (top):
   ├── Height: 180px
   ├── Background: Gray 100 (if no image)
   ├── Object-fit: cover
   └── Position: relative
       └── Open-source badge (if applicable):
           ├── Position: absolute, top: 12px, left: 12px
           ├── Background: Secondary 500
           ├── Color: White
           ├── Padding: 4px 10px
           ├── Border-radius: 12px
           ├── Font: 12px, Medium
           └── Text: "Open-Source"

2. Content (middle):
   Padding: 20px

   Title:
   ├── Font: 20px, SemiBold (H5)
   ├── Color: Gray 900
   ├── Margin-bottom: 8px
   ├── Line-clamp: 2 (max 2 lines)
   └── Text: [Solution Name]

   Description:
   ├── Font: 14px, Regular
   ├── Color: Gray 600
   ├── Line-height: 20px
   ├── Line-clamp: 3 (max 3 lines)
   ├── Margin-bottom: 16px
   └── Text: [Brief description]

   Tags:
   ├── Display: flex, flex-wrap, gap: 8px
   ├── Margin-bottom: 16px
   └── Tag pills:
       ├── Background: Gray 100
       ├── Color: Gray 700
       ├── Padding: 4px 10px
       ├── Border-radius: 6px
       ├── Font: 12px, Regular
       └── Max: 3 tags visible

   Practical Metrics (ВАЖНО: НЕ социальные метрики):
   ├── Display: flex, gap: 16px
   ├── Font: 12px, Medium
   ├── Color: Gray 600
   └── Metrics:
       ├── Icon + "Задача: [task name]"
       └── Icon + "Результат: [outcome]"

       ЗАПРЕЩЕНО:
       ✗ Лайки
       ✗ Просмотры
       ✗ Звездочки
       ✗ Общий рейтинг

3. Footer (bottom):
   Border-top: 1px solid Gray 200
   Padding: 16px 20px
   Display: flex, justify-between, align-items: center

   Author:
   ├── Display: flex, align-items: center, gap: 8px
   ├── Avatar (32px, rounded)
   ├── Name:
   │   ├── Font: 14px, Medium
   │   ├── Color: Gray 900
   │   └── Link to profile
   └── Role badge (optional, e.g., "Стартап")

   CTA:
   └── Button:
       ├── Size: Small
       ├── Variant: Primary or Secondary
       └── Text: "Подробнее" or "Попробовать"
```

##### 6. Empty State (No Results)
```
Padding: 64px 48px
Text-align: center

Icon:
├── Size: 64px
├── Color: Gray 400
└── Icon: search or folder-open

H3:
├── Text: "Решения не найдены"
├── Font: 24px, SemiBold
├── Color: Gray 900
└── Margin: 16px 0 8px

Description:
├── Font: 16px, Regular
├── Color: Gray 600
└── Text: "Попробуйте изменить фильтры или поисковый запрос"

CTA:
└── Button: "Сбросить фильтры" (secondary, medium)
```

##### 7. Pagination
```
Padding: 32px 48px
Display: flex, justify-content: center
Background: Gray 50

Structure:
├── Display: flex, gap: 8px
└── Buttons:
    ├── Previous (icon: chevron-left)
    ├── Page numbers (1, 2, 3, ..., 10)
    │   ├── Active page: Primary 600, white text
    │   └── Other pages: White, Gray 700 text
    └── Next (icon: chevron-right)

Each button:
├── Size: 40px × 40px
├── Border-radius: 8px
├── Font: 14px, Medium
└── Hover: Background Gray 100
```

---

### Tablet Layout (768px)

Изменения:
```
Filters Panel:
├── Not visible by default
├── Opens as modal/drawer when "Фильтры" button clicked
└── Button added to header area

Solutions Grid:
├── Columns: 2 (instead of 3)
└── Gap: 20px

Padding:
└── Reduced to 24px
```

---

### Mobile Layout (375px)

Изменения:
```
Search Bar:
├── Sticky at top (below nav)
└── Full-width, padding 16px

Filters:
├── Bottom sheet or full modal
└── "Фильтры" button in header

Solutions Grid:
├── 1 column (stack)
├── Gap: 16px
└── Padding: 16px

Solution Card:
├── Thumbnail: 200px height
└── Content simplified

Pagination:
├── Simplified to: Prev, Current, Next
└── Full-width buttons
```

---

## 👤 Screen 3: Профиль участника (User Profile)

### Общие параметры
- **URL**: `/profile/{username}` или `/profile/{id}`
- **Варианты**: Startup, Expert, SME
- **Цель**: Информация о пользователе, репутация, проекты

---

### Desktop Layout (1440px) - Startup Profile

#### Структура экрана

```
┌─────────────────────────────────────────────────────────────┐
│ Top Navigation Bar (64px height)                            │
├──────────────┬──────────────────────────────────────────────┤
│              │                                               │
│  AI          │  Profile Header                               │
│  Assistant   │  ┌─────────────────────────────────────────┐ │
│  Slot        │  │ ┌────┐                                   │ │
│              │  │ │Logo│ Company Name | Role | Verified    │ │
│  (360px      │  │ └────┘ Description                       │ │
│   fixed)     │  │        Contact Info                      │ │
│              │  └─────────────────────────────────────────┘ │
│              │                                               │
│              │  ┌─────────────────────────────────────────┐ │
│              │  │ Reputation Section                       │ │
│              │  │ ┌──────┐ ┌──────┐ ┌──────┐              │ │
│              │  │ │ Pub  │ │Implem│ │Result│              │ │
│              │  │ │Solut.│ │entati│ │Metric│              │ │
│              │  │ └──────┘ └──────┘ └──────┘              │ │
│              │  └─────────────────────────────────────────┘ │
│              │                                               │
│              │  ┌─────────────────────────────────────────┐ │
│              │  │ Solutions Grid                           │ │
│              │  │ ┌────┐ ┌────┐ ┌────┐ ┌────┐             │ │
│              │  │ │Sol1│ │Sol2│ │Sol3│ │Sol4│             │ │
│              │  │ └────┘ └────┘ └────┘ └────┘             │ │
│              │  └─────────────────────────────────────────┘ │
│              │                                               │
├──────────────┴───────────────────────────────────────────────┤
│ Footer                                                        │
└───────────────────────────────────────────────────────────────┘
```

---

#### Компоненты детально

##### 1. Profile Header
```
Padding: 48px 48px 32px
Background: White
Border-bottom: 1px solid Gray 200

Layout: flex, gap: 24px

Left Section (Avatar/Logo):
├── Size: 120px × 120px
├── Border-radius: 12px
├── Border: 2px solid Gray 200
├── Background: White
└── Image or placeholder

Right Section (Info):
├── Flex-grow: 1
└── Content:
    ├── Top Row (flex, justify-between):
    │   ├── Left:
    │   │   ├── Company Name (H2, 36px, Bold)
    │   │   ├── Role Badge:
    │   │   │   ├── Background: Primary 100
    │   │   │   ├── Color: Primary 700
    │   │   │   ├── Padding: 4px 12px
    │   │   │   ├── Border-radius: 12px
    │   │   │   ├── Font: 14px, Medium
    │   │   │   └── Text: "Стартап"
    │   │   └── Verification Badge (if verified):
    │   │       ├── Icon: check-badge (20px)
    │   │       ├── Color: Primary 600
    │   │       └── Tooltip: "Верифицирован"
    │   │
    │   └── Right (if own profile):
    │       └── Button: "Редактировать" (secondary, medium)
    │
    ├── Description:
    │   ├── Margin-top: 16px
    │   ├── Font: 16px, Regular
    │   ├── Color: Gray 700
    │   ├── Line-height: 24px
    │   ├── Max-width: 700px
    │   └── Text: [Company description, what they do]
    │
    ├── Meta Info:
    │   ├── Margin-top: 16px
    │   ├── Display: flex, gap: 24px
    │   ├── Font: 14px, Regular
    │   ├── Color: Gray 600
    │   └── Items:
    │       ├── Icon + "Зарегистрирован: [date]"
    │       ├── Icon + "Последняя активность: [date]"
    │       └── Icon + "Отрасль: [industry]"
    │
    └── Contact Info:
        ├── Margin-top: 16px
        ├── Display: flex, gap: 16px
        └── Items:
            ├── Website link (icon + url)
            ├── Email link (if public)
            ├── Social links (GitHub, Telegram, etc.)
            └── Button: "Связаться" (primary, medium)
```

##### 2. Reputation Section (Startup)
```
Padding: 32px 48px
Background: Gray 50

Header:
├── H3: "Репутация и достижения"
├── Font: 24px, SemiBold
├── Margin-bottom: 24px
└── Subtitle: "Основано на вкладе в решения" (14px, Gray 600)

ВАЖНО: НЕ рейтинг личности, а вклад в решения!

Metrics Grid:
├── Display: grid
├── Columns: 3
├── Gap: 24px
└── Metric Cards:

Metric Card Structure:
├── Background: White
├── Border: 1px solid Gray 200
├── Border-radius: 12px
├── Padding: 24px
├── Text-align: center
└── Content:
    ├── Icon (48px, Primary 600)
    ├── Margin-bottom: 12px
    ├── Value (H2, 36px, Bold, Gray 900)
    ├── Margin-bottom: 4px
    ├── Label (14px, Regular, Gray 600)
    └── Description (12px, Gray 500, optional)

3 Metrics (Startup):

1. Опубликованные решения
   ├── Icon: code
   ├── Value: "12"
   └── Label: "Решений опубликовано"

2. Внедрения
   ├── Icon: rocket-launch
   ├── Value: "47"
   └── Label: "Успешных внедрений"

3. Практические результаты
   ├── Icon: chart-bar
   ├── Value: "85%"
   └── Label: "Средняя эффективность"
   └── Description: "Измеряется реальными метриками бизнеса"

ЗАПРЕЩЕНО для репутации:
✗ Лайки, звезды
✗ Общий рейтинг
✗ Социальные метрики
✗ Просмотры
```

##### 3. Solutions Section (for Startup)
```
Padding: 48px

Header:
├── Display: flex, justify-between, align-items: center
├── H3: "Опубликованные решения (12)"
├── Font: 24px, SemiBold
└── View All Link (if many): "Посмотреть все →"

Solutions Grid:
├── Display: grid
├── Columns: 4 (desktop)
├── Gap: 20px
├── Margin-top: 24px
└── Solution Cards (compact version):

Compact Solution Card:
├── Background: White
├── Border: 1px solid Gray 200
├── Border-radius: 12px
├── Padding: 16px
├── Min-height: 240px
└── Content:
    ├── Icon/Thumbnail (80px × 80px)
    ├── Margin-bottom: 12px
    ├── Title (16px, SemiBold, line-clamp: 2)
    ├── Margin-bottom: 8px
    ├── Description (14px, Regular, line-clamp: 2)
    ├── Margin-bottom: 12px
    ├── Tags (1-2 tags max, small)
    ├── Margin-bottom: 12px
    └── CTA Link: "Подробнее →"
```

---

### Expert Profile (Variant)

Отличия от Startup:

```
Reputation Metrics (Expert):

1. Проекты
   ├── Icon: briefcase
   ├── Value: "23"
   └── Label: "Завершенных проектов"

2. Области экспертизы
   ├── Icon: academic-cap
   ├── Value: "5"
   └── Label: "Областей специализации"
   └── List: "ИИ, ML, NLP, Автоматизация, CRM"

3. Опубликованные материалы
   ├── Icon: document-text
   ├── Value: "18"
   └── Label: "Статей и гайдов"

Projects Section (instead of Solutions):
├── H3: "Портфолио проектов"
└── Grid of project cards (similar structure to solution cards)

Additional Section:
├── Skills & Expertise
└── List or tags of skills
```

---

### SME Profile (Variant)

Отличия:

```
Reputation Metrics (SME):

1. Внедренные решения
   ├── Icon: check-circle
   ├── Value: "8"
   └── Label: "Внедрено решений"

2. Активность на платформе
   ├── Icon: fire
   ├── Value: "92"
   └── Label: "Дней активности"

3. Обратная связь
   ├── Icon: chat-bubble
   ├── Value: "4.8/5"
   └── Label: "Средняя оценка обратной связи"
   └── Note: "Только для бизнес-взаимодействий"

Implemented Solutions Section:
├── H3: "Внедренные решения"
└── Grid of solution cards they've adopted

Company Info Section:
├── H3: "О компании"
└── Details about the SME
```

---

### Tablet & Mobile Adaptations

Tablet (768px):
```
Profile Header:
├── Stack avatar and info vertically
└── Reduced padding: 32px

Reputation Metrics:
└── 2 columns or stacked

Solutions/Projects Grid:
└── 2 columns
```

Mobile (375px):
```
Profile Header:
├── Avatar: 80px
├── Padding: 16px
└── All info stacked

Reputation Metrics:
└── 1 column (stacked cards)

Solutions/Projects Grid:
└── 1 column

Contact Info:
└── Full-width buttons
```

---

## 🤖 Screen 4: Страница агента/песочницы (Agent Sandbox)

### Общие параметры
- **URL**: `/sandbox/{agent-id}` or `/agent/{agent-id}`
- **Варианты**: Chat, Form, Combined
- **Цель**: Работа с ИИ-агентами, прозрачность

---

### Desktop Layout (1440px) - Chat Variant

#### Структура экрана

```
┌─────────────────────────────────────────────────────────────┐
│ Top Navigation Bar (64px height)                            │
├──────────────┬──────────────────────────────────────────────┤
│              │                                               │
│  AI Assist   │  Agent Header                                 │
│  (optional,  │  ┌─────────────────────────────────────────┐ │
│   collapse)  │  │ Agent Name | Description | Status        │ │
│              │  │ [Start] [Stop] [Reset] Controls          │ │
│              │  └─────────────────────────────────────────┘ │
│              │                                               │
│              │  ┌──────────────────┬─────────────────────┐  │
│              │  │                  │ Sidebar (optional)  │  │
│              │  │  Chat Area       │                     │  │
│              │  │                  │ - History           │  │
│              │  │  ┌────────────┐  │ - Saved Configs     │  │
│              │  │  │User:       │  │ - Examples          │  │
│              │  │  │Message     │  │ - Help              │  │
│              │  │  └────────────┘  │                     │  │
│              │  │                  │                     │  │
│              │  │  ┌────────────┐  │                     │  │
│              │  │  │Agent:      │  │                     │  │
│              │  │  │Response    │  │                     │  │
│              │  │  └────────────┘  │                     │  │
│              │  │                  │                     │  │
│              │  │  [Input Field]   │                     │  │
│              │  │                  │                     │  │
│              │  ├──────────────────┴─────────────────────┤  │
│              │  │ Results Panel / Visualizations         │  │
│              │  └────────────────────────────────────────┘  │
│              │                                               │
│              │  ┌─────────────────────────────────────────┐ │
│              │  │ AI Transparency Section                  │ │
│              │  │ [How it works] [Sources] [Confidence]    │ │
│              │  └─────────────────────────────────────────┘ │
│              │                                               │
├──────────────┴───────────────────────────────────────────────┤
│ Footer                                                        │
└───────────────────────────────────────────────────────────────┘
```

---

#### Компоненты детально

##### 1. Agent Header
```
Padding: 24px 48px
Background: White
Border-bottom: 1px solid Gray 200

Layout: flex, justify-between, align-items: center

Left Section:
├── Icon/Avatar (48px)
├── Spacing: 16px
└── Info:
    ├── Agent Name (H4, 24px, SemiBold)
    ├── Description (14px, Gray 600)
    └── Category badge (e.g., "Аналитика", "Автоматизация")

Middle Section:
└── Status Indicator:
    ├── Display: flex, align-items: center, gap: 8px
    ├── Dot (8px, animated if active):
    │   ├── Active: Secondary 500, pulsing
    │   └── Inactive: Gray 400
    └── Text:
        ├── Active: "Агент активен" (Secondary 700)
        └── Inactive: "Агент неактивен" (Gray 600)

Right Section:
└── Controls:
    ├── Display: flex, gap: 12px
    └── Buttons:
        ├── "Запустить" (primary, medium) - if inactive
        ├── "Остановить" (secondary, medium) - if active
        └── "Сбросить" (text button) - always available
```

##### 2. Chat Area (Main Workspace)
```
Layout: flex-direction: column
Height: calc(100vh - 64px - header - footer)
Background: Gray 50
Padding: 24px 48px

Messages Container:
├── Flex-grow: 1
├── Overflow-y: auto
├── Padding-bottom: 24px
└── Messages:

User Message:
├── Align: flex-end (right)
├── Max-width: 70%
├── Margin-bottom: 16px
└── Structure:
    ├── Background: Primary 600
    ├── Color: White
    ├── Padding: 12px 16px
    ├── Border-radius: 16px 16px 4px 16px
    ├── Font: 16px, Regular
    └── Timestamp: 12px, White with 0.8 opacity

Agent Message:
├── Align: flex-start (left)
├── Max-width: 70%
├── Margin-bottom: 16px
└── Structure:
    ├── Display: flex, gap: 12px
    ├── Avatar (32px, left)
    └── Content:
        ├── Background: White
        ├── Color: Gray 900
        ├── Padding: 12px 16px
        ├── Border-radius: 16px 16px 16px 4px
        ├── Border: 1px solid Gray 200
        ├── Font: 16px, Regular
        ├── Timestamp: 12px, Gray 500
        └── Actions (if applicable):
            ├── Copy button
            ├── Regenerate button
            └── Feedback (thumbs up/down)

Typing Indicator (when agent is processing):
├── Display: flex, gap: 4px
├── Dots (3):
│   ├── Size: 8px
│   ├── Background: Gray 400
│   ├── Border-radius: 50%
│   └── Animation: bounce
└── Text: "Агент печатает..."

Empty State (no messages yet):
├── Text-align: center
├── Padding: 64px 24px
└── Content:
    ├── Icon (64px, Gray 400)
    ├── H5: "Начните разговор с агентом"
    ├── Description: "Задайте вопрос или выберите пример"
    └── Quick start buttons (examples)
```

##### 3. Input Area (sticky bottom of chat)
```
Position: sticky, bottom: 0
Background: White
Border-top: 1px solid Gray 200
Padding: 20px 48px

Structure:
├── Display: flex, gap: 12px
├── Align-items: flex-end
└── Components:

Textarea:
├── Flex-grow: 1
├── Min-height: 52px
├── Max-height: 120px (auto-grow)
├── Border: 1px solid Gray 300
├── Border-radius: 12px
├── Padding: 14px 16px
├── Font: 16px, Regular
├── Placeholder: "Введите сообщение..."
├── Resize: none
└── Focus: border Primary 500

Send Button:
├── Size: 52px × 52px (square)
├── Background: Primary 600
├── Border-radius: 12px
├── Icon: paper-airplane (24px, White)
├── Hover: Background Primary 700
└── Disabled (if empty input): Background Gray 300

Additional Controls (above textarea, optional):
├── Attach file button
├── Voice input button
└── Character counter (if limit exists)
```

##### 4. Sidebar (optional, right side)
```
Width: 280px
Background: White
Border-left: 1px solid Gray 200
Padding: 24px
Overflow-y: auto

Sections:

1. History:
   ├── H6: "История" (18px, SemiBold)
   ├── Margin-bottom: 12px
   └── List of previous sessions:
       ├── Each item: clickable
       ├── Date + preview
       └── Hover: background Gray 50

2. Saved Configurations:
   ├── H6: "Сохраненные настройки"
   ├── Margin-bottom: 12px
   └── List of saved configs

3. Examples:
   ├── H6: "Примеры запросов"
   ├── Margin-bottom: 12px
   └── Pills/buttons:
       ├── Background: Gray 100
       ├── Padding: 8px 12px
       ├── Border-radius: 8px
       ├── Font: 14px
       ├── Margin-bottom: 8px
       └── Click: populate input

4. Help:
   ├── H6: "Справка"
   └── Links to documentation
```

##### 5. Results Panel (below chat, expandable)
```
Background: White
Border-top: 1px solid Gray 200
Padding: 24px 48px
Max-height: 400px (resizable)

Header:
├── Display: flex, justify-between
├── H5: "Результаты" (20px, SemiBold)
└── Controls:
    ├── Expand/Collapse button
    ├── Export button (download results)
    └── Clear button

Content (varies by agent output):

Option A: Text Output
├── Font: 14px, monospace
├── Background: Gray 100
├── Padding: 16px
├── Border-radius: 8px
└── Scrollable

Option B: Table
├── Responsive table
├── Sortable columns
└── Export to CSV button

Option C: Chart/Visualization
├── Rendered chart (using libs like Chart.js)
└── Interactive controls

Option D: JSON/Code
├── Syntax highlighted
├── Copy button
└── Collapse/expand sections

Export Dropdown:
├── "Скачать как TXT"
├── "Скачать как JSON"
├── "Скачать как CSV"
└── "Копировать в буфер"
```

##### 6. AI Transparency Section (КРИТИЧЕСКИ ВАЖНО)
```
Padding: 32px 48px
Background: Info 50 (light blue)
Border: 1px solid Info 200
Border-radius: 12px
Margin: 24px 48px

Header:
├── Display: flex, align-items: center, gap: 12px
├── Icon: lightbulb (24px, Info 600)
├── H5: "Как это работает" (20px, SemiBold, Gray 900)
└── Expand/Collapse chevron

Collapsed State:
└── Brief summary (2-3 lines)

Expanded State:
├── Sections (expandable accordions):
│
├── 1. Логика работы
│   ├── Icon: cog
│   └── Content:
│       ├── Explanation of how agent processes requests
│       ├── Steps visualization (numbered list or flowchart)
│       └── Example: "1. Анализ запроса → 2. Поиск данных → 3. Генерация ответа"
│
├── 2. Источники данных
│   ├── Icon: database
│   └── Content:
│       ├── List of data sources used
│       ├── Links to sources (if applicable)
│       └── Data freshness info
│
├── 3. Уверенность в ответе
│   ├── Icon: chart-bar
│   └── Content:
│       ├── Confidence score (e.g., "85%")
│       ├── Progress bar visualization
│       ├── Explanation of what affects confidence
│       └── Disclaimer if low confidence
│
└── 4. Ограничения
    ├── Icon: exclamation-triangle
    └── Content:
        ├── Known limitations of the agent
        ├── Cases where it might not work well
        └── Disclaimer about AI-generated content

Disclaimer (always visible):
├── Font: 12px, Regular, Gray 600
├── Icon: information-circle
└── Text: "Этот агент использует ИИ. Всегда проверяйте критически важную информацию."
```

---

### Form Variant (instead of Chat)

Main Workspace Structure:

```
Agent Workspace
├── Header (same as chat variant)
│
├── Form Area:
│   ├── Padding: 32px 48px
│   ├── Background: White
│   ├── Max-width: 800px
│   └── Form Groups:
│
│       ├── Input 1: Text field
│       │   ├── Label: "Название компании"
│       │   ├── Input: text, required
│       │   └── Help text: optional hint
│       │
│       ├── Input 2: Dropdown
│       │   ├── Label: "Отрасль"
│       │   └── Select: options
│       │
│       ├── Input 3: Slider
│       │   ├── Label: "Уровень детализации"
│       │   ├── Range: 1-10
│       │   └── Current value display
│       │
│       ├── Input 4: Checkbox group
│       │   ├── Label: "Дополнительные опции"
│       │   └── Checkboxes: multiple options
│       │
│       └── Submit:
│           ├── Button: "Запустить анализ" (primary, large)
│           └── Or "Сбросить" (text button)
│
├── Results Panel (same as chat variant)
│   └── Shows after form submission
│
└── AI Transparency (same as chat variant)
```

---

### Combined Variant (Form + Chat)

```
Split View:
├── Left (50%): Form Area
│   └── Configuration panel
│
└── Right (50%): Chat Area
    ├── Discussion with agent about settings
    └── Real-time feedback

Or Tabbed:
├── Tab 1: Конфигурация (Form)
└── Tab 2: Чат (Chat)
```

---

### Tablet & Mobile Adaptations

Tablet (768px):
```
Sidebar:
├── Hidden by default
├── Opens as drawer/modal
└── Toggle button in header

Layout:
├── Full-width chat/form
└── Results panel: collapsible

AI Transparency:
└── Collapsed by default
```

Mobile (375px):
```
AI Assistant Slot:
└── Hidden or bottom sheet

Chat Area:
├── Full screen
├── Input: sticky bottom
└── Messages: full-width (no max-width)

Form:
├── Full-width inputs
└── Stacked layout

Results:
└── Full-screen modal or bottom sheet

Sidebar:
└── Full-screen modal
```

---

## 📏 General Specifications Summary

### All Screens Common Elements

1. **Top Navigation**: Consistent across all screens
2. **AI Assistant Slot**: 360px fixed width on desktop, adaptive on smaller screens
3. **Footer**: Consistent across all screens
4. **Spacing**: 4px base unit, consistent scale
5. **Typography**: Inter font, defined scale
6. **Colors**: Defined palette, consistent usage
7. **Components**: Reusable from design system

---

### Responsive Breakpoints

| Device       | Width  | Columns | Gutter | Margin |
|------------- |--------|---------|--------|--------|
| Desktop XL   | 1920px | 12      | 24px   | auto   |
| Desktop      | 1440px | 12      | 24px   | auto   |
| Desktop Sm   | 1280px | 12      | 24px   | auto   |
| Tablet       | 768px  | 8       | 20px   | 32px   |
| Mobile Lg    | 425px  | 4       | 16px   | 16px   |
| Mobile       | 375px  | 4       | 16px   | 16px   |
| Mobile Sm    | 320px  | 4       | 16px   | 16px   |

---

### Accessibility Requirements

All screens must comply with:
- WCAG 2.1 Level AA (minimum)
- Level AAA preferred for text contrast
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators visible
- Semantic HTML structure

---

**Версия**: 1.0
**Дата**: 2025-12-26
**Автор**: Open-AI.ru Team
