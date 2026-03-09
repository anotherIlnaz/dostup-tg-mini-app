# Доступ Telegram Mini App

Текущий runtime login flow:
- `src/App/App.tsx`
- `src/features/auth/pages/AuthPage.tsx`
- state-management через `effector`
- фронт на `React + Vite + TypeScript`

## Запуск

```bash
npm install
cp .env.example .env
npm run dev
```

Откроется `http://localhost:5173`.

## Auth UI режимы

- `Production Login` (по умолчанию):
  - чистый пользовательский экран
  - основной путь: `Войти через Telegram`
  - альтернативы `Email` и `Телефон` доступны только в `development`
  - без debug-полей и внутренних диагностик
- `Dev Login` (только в DEV):
  - отдельный экран с инженерными инструментами
  - доступ через `?dev=1`
  - путь `/dev-login` работает только если хост настроен на SPA fallback
  - содержит challenge/debug/session state, ручную верификацию и mock session

## Feature flags

Переменные читаются из Vite env:

- `VITE_API_BASE_URL` — адрес API, по умолчанию `http://127.0.0.1:3001`
- `VITE_BASE_PATH` — base path для Vite/Nginx deploy, по умолчанию `/`
- `VITE_APP_ENV` — окружение приложения (`development`, `stage`, `staging`, `production`)
- `VITE_ENABLE_DEV_LOGIN` — включает Dev Login panel (работает только вне production)
- `VITE_ALLOW_DEV_CODE_HINT` — показывает `debug_code` в Dev Panel

Guard:
- Dev UI не рендерится в production (`import.meta.env.PROD` и `VITE_APP_ENV=production`)
- `stage` и `staging` считаются production-like окружениями: Dev UI выключен, резервные `Email` / `Телефон` login methods скрыты

## API контракт

Mini App использует текущий backend-контракт:
- `POST /v1/auth/start`
- `POST /v1/auth/verify`

Telegram-поток в production UI:
1. `start` с `provider=telegram`
2. автоматический `verify` с кодом `telegram`
3. после успешного verify клиент сохраняет `post_login_config`, если backend вернул его

Email/Phone поток:
1. `start` с `provider=email|phone`
2. пользователь вводит OTP
3. `verify`

## Проверка в Telegram

1. Подними API на `http://127.0.0.1:3001`.
2. Подними Mini App (`npm run dev`).
3. Дай публичный HTTPS URL через туннель.
4. Укажи URL в `BotFather -> Menu Button / WebApp`.
5. Открой Mini App из Telegram и нажми `Продолжить через Telegram`.
