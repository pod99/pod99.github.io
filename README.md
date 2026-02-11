# Одностраничный сайт-портфолио + минимальная админка

Статический проект для деплоя на GitHub Pages (подходит для `username.github.io`).

## Структура

- `index.html` — главная страница (лендинг).
- `admin.html` — локальная админка для редактирования контента.
- `data/content.json` — основной JSON с текстами/ссылками.
- `css/style.css` — тёмная тема, адаптивная вёрстка, эффекты.
- `js/main.js` — логика лендинга: загрузка JSON, эффекты, API.
- `js/admin.js` — логика админки (пароль, localStorage, экспорт JSON).
- `js/parallax.js` — параллакс-логотип при скролле/движении мыши.
- `assets/icons/` — SVG-иконки (Telegram, GitHub, Spotify, YouTube, и т.д.).

## Деплой на GitHub Pages

1. Создайте репозиторий `username.github.io` на GitHub.
2. Склонируйте его локально и скопируйте туда все файлы этого проекта.
3. Закоммитьте и запушьте:
   - `git add .`
   - `git commit -m "Initial landing + admin"`
   - `git push origin main`
4. Откройте `https://username.github.io` — должен открыться `index.html`.
5. Админка будет по адресу `https://username.github.io/admin.html`.

## Контент и админка

- Базовый контент хранится в `data/content.json`.
- Админка (`/admin.html`):
  - Статический пароль: **`admin123`** (хэшируется через `btoa` в JS).
  - Позволяет редактировать поля: `telegram`, `githubRepos`, `manifest`, `timeline`, `quotes`, `spotify`, `youtube`.
  - Сохраняет изменения в `localStorage` браузера, которые сразу подхватываются на `index.html`.
  - Может скачать обновлённый `content.json` (кнопка «Скачать JSON»), чтобы вы вручную заменили файл в репозитории.

## Интеграции API

### OpenWeatherMap

В `js/main.js`:

- Найдите константу `API_KEY = "YOUR_OPENWEATHERMAP_API_KEY_HERE"`.
- Замените на свой ключ OpenWeatherMap.
- Погода для Amsterdam и Moscow начнёт загружаться автоматически.

### EmailJS (форма «Идея для сайта?»)

Сейчас форма:

- Логирует данные в `console.log`.
- Показывает автоответ манифестом в блоке под формой.

Для интеграции EmailJS:

1. Зарегистрируйтесь на EmailJS.
2. Добавьте инициализацию и вызов `emailjs.send(...)` внутри обработчика формы в `js/main.js`.
3. Используйте поля `idea` и автоответ как содержимое письма.

### OpenRouter AI (чат)

- Поле для OpenRouter API Key в блоке AI-чата хранит ключ только в `localStorage`.
- Логика запроса реализована в `js/main.js` через `fetch` на `https://openrouter.ai/api/v1/chat/completions`.
- Укажите свой ключ в UI (на странице), а не в коде, чтобы не коммитить его в репозиторий.

## Эффекты

- Параллакс SVG-иконок в логотипе (`js/parallax.js`) с «сборкой» логотипа при скролле.
- Фоновый градиент, меняющийся по секциям (IntersectionObserver в `js/main.js`).
- Cursor-trail с цитатами из `content.json` (обработчик `mousemove` в `js/main.js`).

## Технологии и ограничения

- Только статические файлы: HTML, CSS, JavaScript.
- Без backend и баз данных — всё через JSON и `localStorage`.
- Vanilla JS, без React/Vue/фреймворков.
- Mobile-first, адаптивный дизайн, тёмная тема.

