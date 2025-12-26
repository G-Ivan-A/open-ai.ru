# Design Guidelines: Open-AI.ru Portal

## 🎨 Цветовая палитра

### Основные цвета (Primary Colors)

#### Primary - Синий (Technology & Trust)
```
Primary 50:  #EFF6FF
Primary 100: #DBEAFE
Primary 200: #BFDBFE
Primary 300: #93C5FD
Primary 400: #60A5FA
Primary 500: #3B82F6  ← Основной primary
Primary 600: #2563EB  ← Primary dark
Primary 700: #1D4ED8
Primary 800: #1E40AF
Primary 900: #1E3A8A
```

**Использование**:
- Кнопки Primary
- Активные ссылки
- Акцентные элементы
- Иконки действий
- Активные состояния навигации

---

#### Secondary - Зеленый (Open-Source & Growth)
```
Secondary 50:  #ECFDF5
Secondary 100: #D1FAE5
Secondary 200: #A7F3D0
Secondary 300: #6EE7B7
Secondary 400: #34D399
Secondary 500: #10B981  ← Основной secondary
Secondary 600: #059669
Secondary 700: #047857
Secondary 800: #065F46
Secondary 900: #064E3B
```

**Использование**:
- Open-source бейджи
- Success states
- Позитивные метрики
- Кнопки Secondary
- Индикаторы прогресса

---

### Нейтральные цвета (Neutral Colors)

#### Gray Scale
```
White:    #FFFFFF
Gray 50:  #F9FAFB  ← Background secondary
Gray 100: #F3F4F6  ← Background tertiary
Gray 200: #E5E7EB  ← Borders
Gray 300: #D1D5DB  ← Borders hover
Gray 400: #9CA3AF  ← Placeholder text
Gray 500: #6B7280  ← Text secondary
Gray 600: #4B5563  ← Text primary light
Gray 700: #374151
Gray 800: #1F2937
Gray 900: #111827  ← Text primary
Black:    #000000
```

**Использование**:
- Текст: Gray 900 (primary), Gray 500 (secondary)
- Фоны: White, Gray 50, Gray 100
- Границы: Gray 200, Gray 300
- Disabled элементы: Gray 400

---

### Семантические цвета (Semantic Colors)

#### Success
```
Success 50:  #ECFDF5
Success 500: #10B981  ← Основной
Success 700: #047857
```

**Использование**: успешные действия, подтверждения, положительные состояния

---

#### Warning
```
Warning 50:  #FFFBEB
Warning 500: #F59E0B  ← Основной
Warning 700: #B45309
```

**Использование**: предупреждения, важные уведомления, требующие внимания

---

#### Error
```
Error 50:  #FEF2F2
Error 500: #EF4444  ← Основной
Error 700: #B91C1C
```

**Использование**: ошибки, критические состояния, удаление

---

#### Info
```
Info 50:  #EFF6FF
Info 500: #3B82F6  ← Основной
Info 700: #1D4ED8
```

**Использование**: информационные сообщения, подсказки, справка

---

### Градиенты

#### Primary Gradient
```css
background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
```
**Использование**: Hero-секции, акцентные кнопки, заголовки

#### Secondary Gradient
```css
background: linear-gradient(135deg, #10B981 0%, #059669 100%);
```
**Использование**: Open-source элементы, success states

#### Subtle Background Gradient
```css
background: linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%);
```
**Использование**: фоны секций, карточек

---

## ✍️ Типографика

### Шрифтовая система

#### Основной шрифт: Inter

**Почему Inter**:
- Отличная читаемость на экранах
- Поддержка кириллицы
- Variable font (гибкость)
- Open-source (бесплатный)
- Профессиональный вид

**Подключение**:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**CSS**:
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

---

### Шкала размеров

#### Заголовки (Headings)

```css
/* H1 - Hero Heading */
font-size: 48px;    /* 3rem */
line-height: 56px;  /* 1.167 */
font-weight: 700;   /* Bold */
letter-spacing: -0.02em;

/* H2 - Section Heading */
font-size: 36px;    /* 2.25rem */
line-height: 44px;  /* 1.222 */
font-weight: 700;   /* Bold */
letter-spacing: -0.01em;

/* H3 - Subsection Heading */
font-size: 30px;    /* 1.875rem */
line-height: 38px;  /* 1.267 */
font-weight: 600;   /* SemiBold */
letter-spacing: -0.01em;

/* H4 - Card Heading */
font-size: 24px;    /* 1.5rem */
line-height: 32px;  /* 1.333 */
font-weight: 600;   /* SemiBold */
letter-spacing: 0;

/* H5 - Small Heading */
font-size: 20px;    /* 1.25rem */
line-height: 28px;  /* 1.4 */
font-weight: 500;   /* Medium */
letter-spacing: 0;

/* H6 - Label Heading */
font-size: 18px;    /* 1.125rem */
line-height: 26px;  /* 1.444 */
font-weight: 500;   /* Medium */
letter-spacing: 0;
```

---

#### Текст (Body Text)

```css
/* Body Large */
font-size: 18px;    /* 1.125rem */
line-height: 28px;  /* 1.556 */
font-weight: 400;   /* Regular */
letter-spacing: 0;

/* Body (базовый) */
font-size: 16px;    /* 1rem */
line-height: 24px;  /* 1.5 */
font-weight: 400;   /* Regular */
letter-spacing: 0;

/* Body Small */
font-size: 14px;    /* 0.875rem */
line-height: 20px;  /* 1.429 */
font-weight: 400;   /* Regular */
letter-spacing: 0;

/* Caption */
font-size: 12px;    /* 0.75rem */
line-height: 16px;  /* 1.333 */
font-weight: 400;   /* Regular */
letter-spacing: 0.01em;

/* Overline (uppercase labels) */
font-size: 12px;    /* 0.75rem */
line-height: 16px;  /* 1.333 */
font-weight: 500;   /* Medium */
letter-spacing: 0.08em;
text-transform: uppercase;
```

---

#### Специальные стили

```css
/* Lead Text (intro paragraphs) */
font-size: 20px;    /* 1.25rem */
line-height: 32px;  /* 1.6 */
font-weight: 400;   /* Regular */
color: Gray 600;

/* Code / Monospace */
font-family: 'JetBrains Mono', 'Fira Code', monospace;
font-size: 14px;
line-height: 20px;
font-weight: 400;

/* Link */
font-weight: 500;   /* Medium */
color: Primary 600;
text-decoration: underline;
text-decoration-thickness: 1px;
text-underline-offset: 2px;

/* Link:hover */
color: Primary 700;
```

---

### Типографические правила

1. **Контрастность текста**:
   - Основной текст (Gray 900) на белом фоне: соотношение 14.5:1 ✓
   - Вторичный текст (Gray 500): минимум 4.5:1 ✓
   - Соответствие WCAG AAA

2. **Иерархия**:
   - Заголовок → Lead → Body → Caption
   - Использовать вес и размер для различения

3. **Длина строки**:
   - Оптимально: 60-80 символов (для body text)
   - Максимум: 100 символов

4. **Выравнивание**:
   - Основной контент: left-aligned
   - Заголовки: left или center (в зависимости от контекста)
   - Никогда не использовать justify для UI

---

## 🧱 Компоненты интерфейса

### Кнопки (Buttons)

#### Primary Button
```
Background: Primary 600 (#2563EB)
Text: White
Border-radius: 8px
Padding: 12px 24px (Medium)
Font: 16px, Medium (500)
Shadow: 0 1px 2px rgba(0,0,0,0.05)

Hover:
- Background: Primary 700
- Shadow: 0 4px 6px rgba(37,99,235,0.1)

Active:
- Background: Primary 800
- Shadow: inset 0 2px 4px rgba(0,0,0,0.1)

Disabled:
- Background: Gray 300
- Text: Gray 500
- Cursor: not-allowed
```

#### Secondary Button
```
Background: White
Text: Primary 600
Border: 1px solid Gray 300
Border-radius: 8px
Padding: 12px 24px (Medium)
Font: 16px, Medium (500)

Hover:
- Background: Gray 50
- Border: Primary 300

Active:
- Background: Gray 100
- Border: Primary 600
```

#### Text Button
```
Background: transparent
Text: Primary 600
Font: 16px, Medium (500)

Hover:
- Text: Primary 700
- Text-decoration: underline

Active:
- Text: Primary 800
```

#### Размеры кнопок
```
Small:  Height 36px, Padding 8px 16px,  Font 14px
Medium: Height 44px, Padding 12px 24px, Font 16px
Large:  Height 52px, Padding 16px 32px, Font 18px
```

---

### Карточки (Cards)

#### Базовая карточка
```
Background: White
Border: 1px solid Gray 200
Border-radius: 12px
Padding: 24px
Box-shadow: 0 1px 3px rgba(0,0,0,0.1)

Hover:
- Border: Gray 300
- Box-shadow: 0 4px 6px rgba(0,0,0,0.07), 0 10px 15px rgba(0,0,0,0.03)
- Transform: translateY(-2px)
- Transition: all 0.2s ease
```

#### Карточка решения (Solution Card)
```
Width: 100% (responsive)
Min-height: 320px
Display: flex, flex-direction: column

Components:
1. Thumbnail/Icon (top)
   - Height: 160px
   - Border-radius: 8px (top)

2. Content (middle, flex-grow: 1)
   - Padding: 20px
   - Title: H4 (24px, SemiBold)
   - Description: Body Small (14px)
   - Tags: pills (8px margin)

3. Footer (bottom)
   - Border-top: 1px solid Gray 200
   - Padding: 16px 20px
   - Author info + CTA
```

---

### Поля ввода (Form Inputs)

#### Text Input
```
Height: 44px
Border: 1px solid Gray 300
Border-radius: 8px
Padding: 10px 16px
Font: 16px, Regular
Background: White

Placeholder:
- Color: Gray 400

Focus:
- Border: 2px solid Primary 500
- Box-shadow: 0 0 0 3px rgba(59,130,246,0.1)
- Outline: none

Error:
- Border: 2px solid Error 500
- Box-shadow: 0 0 0 3px rgba(239,68,68,0.1)

Disabled:
- Background: Gray 100
- Color: Gray 500
- Cursor: not-allowed
```

#### Textarea
```
Аналогично Text Input, но:
Min-height: 120px
Padding: 12px 16px
Resize: vertical
```

#### Select / Dropdown
```
Аналогично Text Input, но:
Padding-right: 40px (для иконки стрелки)
Icon: chevron-down (20px, Gray 500)
```

---

### Бейджи и Теги (Badges & Tags)

#### Бейдж Open-Source
```
Background: Secondary 100 (#D1FAE5)
Text: Secondary 700 (#047857)
Font: 12px, Medium (500)
Padding: 4px 10px
Border-radius: 12px (pill shape)
Display: inline-flex, align-items: center
Icon: можно добавить иконку (16px)
```

#### Тег (Tag)
```
Background: Gray 100
Text: Gray 700
Font: 14px, Regular
Padding: 6px 12px
Border-radius: 6px
Border: 1px solid Gray 200

Hover (если кликабельный):
- Background: Gray 200
- Border: Gray 300
```

#### Статус-бейдж
```
Success: Background Success 100, Text Success 700
Warning: Background Warning 100, Text Warning 700
Error: Background Error 100, Text Error 700
Info: Background Info 100, Text Info 700

Indicator dot (опционально):
- Width/Height: 6px
- Border-radius: 50%
- Margin-right: 6px
```

---

### Навигация (Navigation)

#### Топ-навигация (Header)
```
Height: 64px
Background: White
Border-bottom: 1px solid Gray 200
Box-shadow: 0 1px 3px rgba(0,0,0,0.05)
Padding: 0 24px
Display: flex, align-items: center, justify-content: space-between

Logo:
- Height: 32px
- Margin-right: auto

Nav Links:
- Font: 16px, Medium
- Color: Gray 700
- Padding: 8px 16px
- Hover: Color Primary 600, Background Gray 50, Border-radius 6px
- Active: Color Primary 600, Background Primary 50
```

#### Боковой слот (ИИ-ассистент)
```
Width: 360px (фиксированная)
Background: White
Border-right: 1px solid Gray 200
Height: 100vh (full screen)
Position: fixed, left: 0

Header:
- Height: 64px (совпадает с топ-навигацией)
- Border-bottom: 1px solid Gray 200

Content:
- Padding: 16px
- Overflow-y: auto

Footer (input area):
- Position: sticky, bottom: 0
- Background: White
- Border-top: 1px solid Gray 200
- Padding: 16px
```

---

### Иконки (Icons)

#### Библиотеки
- **Основная**: Heroicons (outline и solid)
- **Альтернатива**: Feather Icons, Phosphor Icons

#### Размеры
```
Extra Small: 16px - для inline иконок
Small:       20px - для кнопок, навигации
Medium:      24px - стандартный размер
Large:       32px - для заголовков
Extra Large: 48px - для hero-секций
```

#### Стили
- **Outline**: для большинства UI элементов
- **Solid**: для активных состояний, акцентов
- **Duotone**: для декоративных элементов

#### Цвета
```
Primary: Gray 700 (базовый)
Secondary: Gray 500 (вторичный)
Accent: Primary 600 (активные)
Disabled: Gray 400
```

---

### Модальные окна (Modals)

#### Оверлей
```
Background: rgba(0,0,0,0.5)
Position: fixed, inset: 0
Z-index: 1000
Display: flex, align-items: center, justify-content: center
```

#### Контейнер модала
```
Background: White
Border-radius: 16px
Box-shadow: 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)
Max-width: 600px (можно варьировать)
Width: 90%
Max-height: 90vh
Overflow-y: auto
```

#### Структура
```
Header:
- Padding: 24px 24px 16px
- Border-bottom: 1px solid Gray 200
- Title: H4
- Close button: top-right (24px icon)

Body:
- Padding: 24px
- Overflow-y: auto

Footer:
- Padding: 16px 24px 24px
- Border-top: 1px solid Gray 200
- Display: flex, justify-content: flex-end
- Gap: 12px (между кнопками)
```

---

## 📐 Сетка и отступы

### Grid System

#### 12-колоночная сетка
```
Columns: 12
Gutter:
- Desktop: 24px
- Tablet:  20px
- Mobile:  16px

Container Max-width:
- Desktop XL: 1440px
- Desktop:    1280px
- Tablet:     768px
- Mobile:     100% (с padding 16px)
```

#### Использование
```
Full-width:      12/12 columns
Two-thirds:      8/12 columns
Half:            6/12 columns
One-third:       4/12 columns
Quarter:         3/12 columns
```

---

### Spacing Scale

#### Базовая единица: 4px

```
0:   0px
1:   4px     (0.25rem)
2:   8px     (0.5rem)
3:   12px    (0.75rem)
4:   16px    (1rem)     ← Базовый spacing
5:   20px    (1.25rem)
6:   24px    (1.5rem)
8:   32px    (2rem)
10:  40px    (2.5rem)
12:  48px    (3rem)
16:  64px    (4rem)
20:  80px    (5rem)
24:  96px    (6rem)
32:  128px   (8rem)
```

#### Использование spacing
```
Component padding:     16-24px
Card padding:          20-24px
Section padding:       48-64px (vertical)
Page margin:           24-32px (horizontal)
Button padding:        12px 24px
Icon margin:           8-12px
```

---

### Breakpoints

```css
/* Mobile Small */
@media (min-width: 320px) { ... }

/* Mobile */
@media (min-width: 375px) { ... }

/* Mobile Large */
@media (min-width: 425px) { ... }

/* Tablet */
@media (min-width: 768px) { ... }

/* Desktop Small */
@media (min-width: 1024px) { ... }

/* Desktop */
@media (min-width: 1280px) { ... }

/* Desktop Large */
@media (min-width: 1440px) { ... }

/* Desktop XL */
@media (min-width: 1920px) { ... }
```

---

## 🎭 Состояния и анимации

### Состояния компонентов

#### Интерактивные элементы
```
Default → Hover → Active → Disabled

Transition: all 0.2s ease
```

#### Примеры
```css
/* Button Hover */
transform: translateY(-1px);
box-shadow: увеличение

/* Card Hover */
transform: translateY(-2px);
box-shadow: увеличение
border-color: изменение

/* Link Hover */
color: изменение
text-decoration: появление
```

---

### Анимации (Transitions)

#### Скорость
```
Fast:    0.1s  - для мгновенных изменений (hover иконок)
Normal:  0.2s  - для большинства UI (buttons, cards)
Slow:    0.3s  - для модалов, slide-ins
```

#### Easing функции
```
ease:         cubic-bezier(0.25, 0.1, 0.25, 1) - по умолчанию
ease-in-out:  cubic-bezier(0.42, 0, 0.58, 1)   - smooth start/end
ease-out:     cubic-bezier(0, 0, 0.58, 1)      - для появления элементов
```

#### Примеры
```css
/* Fade In */
opacity: 0 → 1
transition: opacity 0.3s ease-out

/* Slide In (from right) */
transform: translateX(100%) → translateX(0)
transition: transform 0.3s ease-out

/* Scale */
transform: scale(0.95) → scale(1)
transition: transform 0.2s ease-out
```

---

### Loading States

#### Spinner
```
Size: 20px (small), 32px (medium), 48px (large)
Border: 3px solid Primary 600
Border-top: transparent
Animation: rotate 0.6s linear infinite
```

#### Skeleton Loader
```
Background: linear-gradient(90deg, Gray 200 25%, Gray 100 50%, Gray 200 75%)
Background-size: 200% 100%
Animation: shimmer 1.5s ease-in-out infinite
Border-radius: 8px
```

#### Progress Bar
```
Height: 4px
Background: Gray 200
Border-radius: 2px

Fill:
- Background: Primary 600
- Animation: progress linear (зависит от длительности)
```

---

## ♿ Доступность (Accessibility)

### Контрастность

Соответствие WCAG 2.1 Level AAA:
```
Обычный текст:    минимум 7:1
Крупный текст:    минимум 4.5:1
UI компоненты:    минимум 3:1
```

Примеры из палитры:
```
✓ Gray 900 на White: 14.5:1 (отлично)
✓ Gray 700 на White: 9.5:1 (отлично)
✓ Primary 600 на White: 7.2:1 (отлично)
⚠ Gray 500 на White: 4.6:1 (хорошо для крупного текста)
✗ Gray 400 на White: 2.8:1 (только для неактивных элементов)
```

---

### Focus States

```css
/* Видимый focus indicator */
outline: 2px solid Primary 500;
outline-offset: 2px;
border-radius: 8px;

/* Или с box-shadow */
box-shadow: 0 0 0 3px rgba(59,130,246,0.5);
```

**Важно**: Никогда не удалять `outline` без альтернативного focus indicator!

---

### Семантическая разметка

```html
<!-- Используйте правильные HTML теги -->
<button> вместо <div onclick="">
<a> для ссылок
<nav> для навигации
<main> для основного контента
<header>, <footer>, <article>, <section>

<!-- ARIA labels где необходимо -->
<button aria-label="Закрыть модальное окно">
  <svg>...</svg>
</button>

<!-- ARIA live regions для динамического контента -->
<div aria-live="polite" aria-atomic="true">
  Сообщение об успехе
</div>
```

---

### Keyboard Navigation

Обязательные требования:
- Все интерактивные элементы доступны через Tab
- Логический порядок табуляции (top → bottom, left → right)
- Escape закрывает модалы
- Enter активирует кнопки
- Space активирует чекбоксы

---

## 📱 Адаптивный дизайн

### Mobile-First подход

```css
/* Базовые стили для mobile */
.card {
  padding: 16px;
  font-size: 14px;
}

/* Адаптация для tablet */
@media (min-width: 768px) {
  .card {
    padding: 20px;
    font-size: 16px;
  }
}

/* Адаптация для desktop */
@media (min-width: 1280px) {
  .card {
    padding: 24px;
  }
}
```

---

### Адаптивные паттерны

#### Слот ИИ-ассистента
```
Desktop:  фиксированная ширина слева (360px)
Tablet:   drawer (выдвижная панель)
Mobile:   bottom sheet или модальное окно
```

#### Навигация
```
Desktop:  горизонтальное меню в header
Tablet:   горизонтальное меню (может быть свернуто)
Mobile:   hamburger menu (модальное меню)
```

#### Сетка карточек
```
Desktop:   4 колонки (1920px), 3 колонки (1280px)
Tablet:    2 колонки
Mobile:    1 колонка (стек)
```

---

### Тачскрины (Touch Targets)

Минимальный размер кликабельной области:
```
Mobile:  44px × 44px (Apple HIG)
Desktop: 32px × 32px (можно меньше с мышью)
```

Увеличенные отступы между элементами на мобильных:
```
Mobile:  минимум 8px между кнопками
Tablet:  6px
Desktop: 4px
```

---

## 📝 Чек-лист для дизайнера

### Перед началом работы
- [ ] Прочитал CONCEPT.md, STRUCTURE.md, ROLES.md
- [ ] Понял архитектуру "параллельных потоков"
- [ ] Понял принцип "без социальных метрик"
- [ ] Изучил примеры для вдохновения

### Создание дизайн-системы
- [ ] Настроена цветовая палитра в Figma (Color Styles)
- [ ] Настроена типографика (Text Styles)
- [ ] Созданы компоненты кнопок (варианты, состояния)
- [ ] Созданы компоненты карточек
- [ ] Созданы компоненты форм
- [ ] Созданы иконки (набор, организация)
- [ ] Настроены сетки (Layout Grids)

### Создание экранов
- [ ] Главная страница - Desktop (гость + авторизован)
- [ ] Главная страница - Tablet
- [ ] Главная страница - Mobile
- [ ] Каталог решений - Desktop
- [ ] Каталог решений - Tablet
- [ ] Каталог решений - Mobile
- [ ] Профиль участника - Desktop (стартап, специалист, МСП)
- [ ] Профиль участника - Tablet
- [ ] Профиль участника - Mobile
- [ ] Страница агента - Desktop (чат, форма, комбо)
- [ ] Страница агента - Tablet
- [ ] Страница агента - Mobile

### Проверка качества
- [ ] Все экраны используют компоненты из дизайн-системы
- [ ] Проверена контрастность текста (Stark/Contrast plugin)
- [ ] Архитектура "слот слева + слот справа" реализована
- [ ] Нет социальных метрик (лайки, звезды, рейтинги)
- [ ] Прозрачность работы ИИ показана
- [ ] Все интерактивные элементы имеют hover/active состояния
- [ ] Адаптивность проверена на всех брейкпоинтах
- [ ] Пустые состояния (empty states) спроектированы

### Финализация
- [ ] Файл организован (страницы, секции, слои)
- [ ] Компоненты правильно именованы
- [ ] Создан интерактивный прототип (basic flows)
- [ ] Экспорт assets подготовлен (если нужно)
- [ ] Ссылка на Figma доступна для просмотра
- [ ] Презентация дизайна готова

---

## 🔗 Полезные ссылки

### Инструменты
- [Figma](https://figma.com)
- [Stark (accessibility)](https://www.getstark.co/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Шрифты
- [Inter Font](https://rsms.me/inter/)
- [Google Fonts](https://fonts.google.com/)

### Иконки
- [Heroicons](https://heroicons.com/)
- [Feather Icons](https://feathericons.com/)
- [Phosphor Icons](https://phosphoricons.com/)

### Вдохновение
- [Dribbble - Dashboard Design](https://dribbble.com/search/dashboard)
- [Mobbin - Mobile Patterns](https://mobbin.com/)
- [UI Sources](https://www.uisources.com/)

---

**Версия**: 1.0
**Дата**: 2025-12-26
**Автор**: Open-AI.ru Team
