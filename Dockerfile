# Dockerfile
FROM node:20-alpine as builder

WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Стадия production
FROM nginx:alpine

# Копируем собранное приложение в nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем кастомную nginx конфигурацию (опционально)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
