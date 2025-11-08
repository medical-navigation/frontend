Medical Navigation - Фронтенд

Фронтенд приложения на React + Vite.

Локальная разработка:
npm install - установка зависимостей
npm run dev - запуск dev сервера
npm run build - сборка для продакшена

Доступ:
- Локально: http://localhost:5173
- Продакшен: http://localhost:5001

Docker:
- Development: npm run dev (порт 5173)
- Production: используется через deploy репозиторий (порт 5001)

CI/CD: При пуше в main ветку автоматически деплоится на продакшен.

Важные файлы:
Dockerfile - сборка для продакшена
nginx.conf - конфигурация Nginx
vite.config.js - конфигурация Vite с прокси к API

Скрипты:
npm run dev - dev сервер с hot-reload
npm run build - сборка для продакшена
npm run preview - превью собранного приложения

Важно:
- Не удалять Dockerfile и nginx.conf
- После изменений проверять что npm run build работает
