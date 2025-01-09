FROM nginx:alpine

COPY ./backend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
# Используем базовый образ с Node.js для сборки фронтенда
FROM node:16 as build-stage

# Устанавливаем рабочий каталог
WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package.json ./
RUN npm install

# Копируем все файлы и собираем проект
COPY . ./
RUN npm run build

# Переходим на минимальный образ для Nginx
FROM nginx:alpine

# Копируем собранные файлы фронтенда в Nginx
COPY --from=build-stage /app/build /usr/share/nginx/html

# Копируем файл конфигурации Nginx
COPY ./nginx/frontend.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80 для Nginx
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]
