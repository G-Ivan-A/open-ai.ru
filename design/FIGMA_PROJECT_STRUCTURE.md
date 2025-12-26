# Figma Project Structure Guide

## 📁 Организация Figma-файла

### Название проекта
```
Open-AI.ru - Design System & Mockups
```

---

## 📄 Структура страниц (Pages)

### 1. 📖 Cover & Documentation

**Назначение**: Обложка проекта и вводная информация

**Содержимое**:
```
┌─────────────────────────────────────┐
│  Open-AI.ru Design System           │
│                                      │
│  Версия: 1.0                         │
│  Дата: 2025-12-26                    │
│                                      │
│  Содержание:                         │
│  • Design System                     │
│  • Desktop Screens                   │
│  • Tablet Screens                    │
│  • Mobile Screens                    │
│  • User Flows                        │
│                                      │
│  [Ссылка на DESIGN_BRIEF.md]        │
│  [Ссылка на DESIGN_GUIDELINES.md]   │
└─────────────────────────────────────┘
```

---

### 2. 🎨 Design System

**Назначение**: Библиотека стилей и компонентов

#### Организация фреймов:

```
Design System
├── 1. Colors
│   ├── Primary Palette
│   │   ├── Primary 50 - Primary 900 (swatches)
│   │   └── Usage examples
│   ├── Secondary Palette
│   │   ├── Secondary 50 - Secondary 900
│   │   └── Usage examples
│   ├── Neutral Palette
│   │   ├── Gray scale (White - Black)
│   │   └── Usage examples
│   ├── Semantic Colors
│   │   ├── Success, Warning, Error, Info
│   │   └── Usage examples
│   └── Gradients
│       ├── Primary Gradient
│       ├── Secondary Gradient
│       └── Background Gradient
│
├── 2. Typography
│   ├── Font Family
│   │   └── Inter (weights: 400, 500, 600, 700)
│   ├── Headings
│   │   ├── H1 - 48px/700 (example: "Hero Heading")
│   │   ├── H2 - 36px/700 (example: "Section Heading")
│   │   ├── H3 - 30px/600 (example: "Subsection")
│   │   ├── H4 - 24px/600 (example: "Card Heading")
│   │   ├── H5 - 20px/500 (example: "Small Heading")
│   │   └── H6 - 18px/500 (example: "Label")
│   ├── Body Text
│   │   ├── Body Large - 18px/400
│   │   ├── Body - 16px/400
│   │   ├── Body Small - 14px/400
│   │   └── Caption - 12px/400
│   └── Special Styles
│       ├── Lead Text - 20px/400
│       ├── Link - 16px/500
│       └── Overline - 12px/500/uppercase
│
├── 3. Spacing & Grid
│   ├── Spacing Scale
│   │   └── 0, 4px, 8px, 12px, 16px... 128px
│   ├── Grid System
│   │   ├── 12-column grid (desktop)
│   │   ├── Gutter: 24px
│   │   └── Container: 1440px max-width
│   └── Breakpoints
│       └── Mobile (375), Tablet (768), Desktop (1280, 1440, 1920)
│
├── 4. Icons
│   ├── Sizes
│   │   ├── 16px (Extra Small)
│   │   ├── 20px (Small)
│   │   ├── 24px (Medium) ← default
│   │   ├── 32px (Large)
│   │   └── 48px (Extra Large)
│   ├── Styles
│   │   ├── Outline (default)
│   │   └── Solid (active states)
│   └── Icon Set
│       ├── Navigation (home, menu, search, etc.)
│       ├── Actions (edit, delete, download, etc.)
│       ├── Status (check, error, warning, info)
│       └── Social (github, telegram, etc.)
│
└── 5. Components
    ├── Buttons
    │   ├── Primary
    │   │   ├── Variants: Small, Medium, Large
    │   │   └── States: Default, Hover, Active, Disabled
    │   ├── Secondary
    │   │   └── [Same variants and states]
    │   └── Text Button
    │       └── [Same variants and states]
    │
    ├── Form Elements
    │   ├── Text Input
    │   │   └── States: Default, Focus, Error, Disabled
    │   ├── Textarea
    │   ├── Select/Dropdown
    │   ├── Checkbox
    │   └── Radio Button
    │
    ├── Cards
    │   ├── Base Card
    │   │   └── States: Default, Hover
    │   ├── Solution Card
    │   │   ├── With image
    │   │   └── Without image
    │   └── Profile Card
    │
    ├── Badges & Tags
    │   ├── Open-Source Badge
    │   ├── Tag (general)
    │   └── Status Badges
    │       ├── Success, Warning, Error, Info
    │       └── With/without indicator dot
    │
    ├── Navigation
    │   ├── Top Navigation Bar
    │   │   ├── Logo area
    │   │   ├── Nav links
    │   │   ├── Search
    │   │   └── User menu
    │   ├── AI Assistant Slot (sidebar)
    │   │   ├── Header
    │   │   ├── Content area
    │   │   └── Input area
    │   └── Breadcrumbs
    │
    ├── Modals
    │   ├── Small (400px)
    │   ├── Medium (600px)
    │   └── Large (800px)
    │
    └── Miscellaneous
        ├── Loader/Spinner
        ├── Progress Bar
        ├── Skeleton Loader
        ├── Empty State
        └── Error State
```

---

### 3. 🖥️ Desktop Screens (1440px width)

**Назначение**: Полноразмерные макеты для desktop

#### Организация фреймов:

```
Desktop Screens
├── 1. Home Page
│   ├── 1.1 Home - Guest View
│   │   ├── Frame: 1440 × variable height
│   │   └── Components:
│   │       ├── Top Navigation (guest)
│   │       ├── AI Assistant Slot (left)
│   │       ├── Main Content (right)
│   │       │   ├── Hero Section
│   │       │   ├── Key Features (cards)
│   │       │   ├── Starting Sections
│   │       │   ├── Platform Stats (optional)
│   │       │   └── CTA Section
│   │       └── Footer
│   │
│   └── 1.2 Home - Authenticated View
│       ├── Frame: 1440 × variable height
│       └── Components:
│           ├── Top Navigation (authenticated)
│           ├── AI Assistant Slot (left)
│           ├── Personalized Dashboard (right)
│           │   ├── Welcome Section
│           │   ├── Recent Activity
│           │   ├── Recommended Solutions
│           │   └── Quick Actions
│           └── Footer
│
├── 2. Solutions Catalog
│   ├── Frame: 1440 × variable height
│   └── Components:
│       ├── Top Navigation
│       ├── AI Assistant Slot (left)
│       ├── Catalog Main (right)
│       │   ├── Header & Description
│       │   ├── Filters Panel (left sidebar or top)
│       │   ├── Search Bar
│       │   ├── Solutions Grid (3-4 columns)
│       │   │   ├── Solution Card × N
│       │   │   └── [Card structure: image, title, description, tags, metrics, author, CTA]
│       │   └── Pagination
│       └── Footer
│
├── 3. User Profile
│   ├── 3.1 Startup Profile
│   │   ├── Frame: 1440 × variable height
│   │   └── Components:
│   │       ├── Top Navigation
│   │       ├── AI Assistant Slot (left)
│   │       ├── Profile Main (right)
│   │       │   ├── Profile Header
│   │       │   │   ├── Logo/Avatar
│   │       │   │   ├── Company Name
│   │       │   │   ├── Role Badge
│   │       │   │   ├── Verification Status
│   │       │   │   └── Description
│   │       │   ├── Reputation Section
│   │       │   │   ├── Published Solutions Count
│   │       │   │   ├── Implementations Count
│   │       │   │   └── Practical Metrics
│   │       │   ├── Solutions Grid
│   │       │   │   └── Solution Cards (compact)
│   │       │   └── Contact Info
│   │       └── Footer
│   │
│   ├── 3.2 Expert Profile
│   │   └── [Similar structure, but:
│   │       - Reputation: Projects, Expertise, Materials
│   │       - Projects instead of Solutions]
│   │
│   └── 3.3 SME Profile
│       └── [Similar structure, but:
│           - Reputation: Implemented Solutions, Activity
│           - Implemented Solutions instead of Projects]
│
└── 4. Agent Sandbox
    ├── 4.1 Chat Variant
    │   ├── Frame: 1440 × variable height
    │   └── Components:
    │       ├── Top Navigation
    │       ├── AI Assistant Slot (collapsible)
    │       ├── Sandbox Main (right)
    │       │   ├── Agent Header
    │       │   │   ├── Agent Name
    │       │   │   ├── Description
    │       │   │   ├── Status
    │       │   │   └── Controls (start/stop/reset)
    │       │   ├── Chat Area
    │       │   │   ├── Message History
    │       │   │   └── Input Field with Send
    │       │   ├── Results Panel
    │       │   │   └── Visualizations
    │       │   └── AI Transparency Section
    │       │       ├── "How it works" expandable
    │       │       └── Sources & confidence
    │       └── Sidebar (optional)
    │           ├── History
    │           ├── Saved Configs
    │           └── Examples
    │
    ├── 4.2 Form Variant
    │   └── [Similar, but:
    │       - Parameters Form instead of Chat
    │       - "Run" button]
    │
    └── 4.3 Combined Variant
        └── [Form + Chat in one interface]
```

---

### 4. 📱 Tablet Screens (768px width)

**Назначение**: Макеты для планшетов

#### Организация:

```
Tablet Screens
├── Same structure as Desktop, but:
│   ├── Frame width: 768px
│   ├── AI Assistant: drawer (выдвижная панель)
│   ├── Solutions Grid: 2 columns
│   └── Simplified layouts where needed
│
└── Screens:
    ├── 1. Home Page (Guest & Authenticated)
    ├── 2. Solutions Catalog
    ├── 3. User Profile (all variants)
    └── 4. Agent Sandbox (all variants)
```

---

### 5. 📱 Mobile Screens (375px width)

**Назначение**: Макеты для мобильных устройств

#### Организация:

```
Mobile Screens
├── Same structure as Desktop, but:
│   ├── Frame width: 375px
│   ├── AI Assistant: bottom sheet or modal
│   ├── Navigation: hamburger menu
│   ├── Solutions Grid: 1 column (stack)
│   └── Stacked layouts
│
└── Screens:
    ├── 1. Home Page
    │   ├── Guest View
    │   └── Authenticated View
    ├── 2. Solutions Catalog
    │   ├── List View
    │   └── Filter Modal
    ├── 3. User Profile
    │   ├── Startup Profile
    │   ├── Expert Profile
    │   └── SME Profile
    └── 4. Agent Sandbox
        ├── Chat Variant
        ├── Form Variant
        └── Combined Variant
```

---

### 6. 🔄 User Flows

**Назначение**: Визуализация пользовательских путей

#### Организация:

```
User Flows
├── 1. Registration Flow
│   ├── Landing → Registration → Role Selection → Profile Setup → Dashboard
│   └── FigJam or Frames with connectors
│
├── 2. Solution Discovery Flow
│   ├── Home → Catalog → Filter → Solution Detail → Contact/Try
│   └── Show decision points
│
├── 3. Agent Usage Flow
│   ├── Dashboard → Agent Selection → Sandbox → Configure → Run → Results
│   └── Include error/success paths
│
└── 4. Profile Creation Flow (optional)
    └── For each role: Startup, Expert, SME
```

---

### 7. 🎭 States & Variations (optional)

**Назначение**: Различные состояния экранов

```
States & Variations
├── Empty States
│   ├── No search results
│   ├── No solutions in catalog
│   └── Empty profile (no projects)
│
├── Loading States
│   ├── Page loading
│   ├── Card skeletons
│   └── Agent processing
│
└── Error States
    ├── 404 Page
    ├── 500 Error
    └── Form validation errors
```

---

## 🏷️ Naming Conventions

### Frames (Фреймы)
```
[Number]. [Screen Name] - [Variant]

Examples:
1. Home Page - Guest View
2. Solutions Catalog
3.1 User Profile - Startup
4.2 Agent Sandbox - Form Variant
```

### Components (Компоненты)
```
[Category]/[Component Name]/[Variant]

Examples:
Button/Primary/Medium
Card/Solution Card/With Image
Navigation/Top Nav/Authenticated
Form/Text Input/Error State
```

### Layers (Слои)
```
[Section]/[Component]/[Element]

Examples:
Header/Navigation/Logo
Hero/CTA/Primary Button
Card/Content/Title
```

---

## 🎨 Using Figma Features

### Auto Layout
- Используйте Auto Layout для всех компонентов
- Настройте padding и spacing через Auto Layout
- Это обеспечит responsive behavior

### Components & Variants
```
Button (Base Component)
├── Type: Primary, Secondary, Text
├── Size: Small, Medium, Large
└── State: Default, Hover, Active, Disabled
```

Используйте **Variants** для создания всех комбинаций

### Styles

#### Color Styles
```
Primary/500
Primary/600 (Main)
Primary/700
...
Secondary/500
...
Gray/900 (Text Primary)
Gray/500 (Text Secondary)
...
```

#### Text Styles
```
Heading/H1
Heading/H2
...
Body/Large
Body/Regular
Body/Small
...
```

#### Effect Styles (тени)
```
Shadow/Small - box-shadow для карточек
Shadow/Medium - box-shadow для модалов
Shadow/Large - box-shadow для floating elements
```

---

## 📐 Layout Grids

### Desktop Grid
```
Type: Columns
Count: 12
Gutter: 24px
Margin: auto (centered)
Max width: 1440px
```

### Tablet Grid
```
Type: Columns
Count: 8
Gutter: 20px
Margin: 32px
```

### Mobile Grid
```
Type: Columns
Count: 4
Gutter: 16px
Margin: 16px
```

---

## 🔧 Plugins Recommendations

### Обязательные
1. **Stark** - проверка доступности и контрастности
2. **Contrast** - быстрая проверка цветовых соотношений
3. **Auto Layout** - помощь с responsive design

### Рекомендуемые
1. **Iconify** - доступ к иконкам Heroicons прямо в Figma
2. **Content Reel** - генерация placeholder контента
3. **Unsplash** - фото для mockups
4. **Figmotion** - создание анимаций (advanced)
5. **Component Inspector** - анализ компонентов

---

## 📤 Export & Handoff

### Assets Export
```
Design System/Icons/
├── Export as SVG
├── Naming: icon-name.svg
└── Settings:
    - SVG
    - Include "id" attribute
    - Outline text

Components/
├── Export specs via Inspect panel
└── Developers can use Figma Dev Mode
```

### Developer Handoff
1. Включите **Dev Mode** в Figma
2. Убедитесь, что все компоненты корректно именованы
3. Добавьте описания к ключевым компонентам
4. Укажите ссылки на DESIGN_GUIDELINES.md

---

## ✅ Quality Checklist

### Организация файла
- [ ] Все страницы созданы и организованы
- [ ] Naming conventions соблюдены
- [ ] Фреймы правильно именованы

### Design System
- [ ] Все цвета добавлены как Color Styles
- [ ] Все типографические стили добавлены как Text Styles
- [ ] Все компоненты созданы и используют Auto Layout
- [ ] Variants настроены для всех состояний

### Screens
- [ ] Все 4 экрана созданы для Desktop
- [ ] Все 4 экрана созданы для Tablet
- [ ] Все 4 экрана созданы для Mobile
- [ ] Все экраны используют компоненты из Design System
- [ ] Layout Grid применен ко всем фреймам

### Accessibility
- [ ] Контрастность проверена (Stark plugin)
- [ ] Минимум 7:1 для основного текста
- [ ] Интерактивные элементы четко обозначены

### Consistency
- [ ] Единый spacing во всех макетах
- [ ] Единый стиль карточек
- [ ] Единая типографика
- [ ] Единая цветовая палитра

---

## 🔗 Sharing Settings

### Публикация проекта
```
1. File → Publish styles and components
   - Публикует дизайн-систему для переиспользования

2. Share → Copy link
   - Настройте доступ: "Anyone with the link can view"
   - Скопируйте ссылку для PR

3. Prototype
   - Создайте прототип основных flows
   - Share prototype link
```

---

## 📋 Final Deliverables

### Что должно быть в финальном файле

1. **Design System** (полная библиотека)
   - Colors, Typography, Components, Icons

2. **Desktop Mockups** (1440px)
   - 4 ключевых экрана + варианты

3. **Tablet Mockups** (768px)
   - Те же 4 экрана

4. **Mobile Mockups** (375px)
   - Те же 4 экрана

5. **User Flows** (опционально но рекомендуется)
   - Основные пользовательские пути

6. **Interactive Prototype** (базовый)
   - Основные переходы между экранами

7. **Documentation**
   - Cover page с описанием
   - Комментарии к ключевым решениям

---

**Версия**: 1.0
**Дата**: 2025-12-26
**Автор**: Open-AI.ru Team
