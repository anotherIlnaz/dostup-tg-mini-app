# Доступ Telegram Mini App

Репозиторий собран по паттерну `tt-spa`:
- `src/services/...` с разделением на `*.model.ts`, `*.api.ts`, `*.container.tsx`, `view/...`
- state-management через `effector`
- фронт на `React + Vite + TypeScript`

## Запуск

```bash
npm install
npm run dev
```

Откроется `http://localhost:5173`.

## Что реализовано

- Вход/регистрация в одном тестовом контуре через:
  - Telegram WebApp (`provider=telegram`, `telegram_init_data`)
  - Email (`provider=email`)
  - Телефон (`provider=phone`)
- API:
  - `POST /v1/auth/start`
  - `POST /v1/auth/verify`
- Сессия хранится в `localStorage` для быстрой проверки.

## Проверка в Telegram

1. Подними API (`http://127.0.0.1:3001`).
2. Подними Mini App (`npm run dev`).
3. Дай публичный HTTPS URL через туннель (например, Cloudflare Tunnel).
4. Укажи URL в `BotFather -> Menu Button / WebApp`.
5. Открой Mini App из Telegram и нажми `Войти через Telegram`.
