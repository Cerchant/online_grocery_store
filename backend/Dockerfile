# Используем Python образ
FROM python:3.9-slim

# Устанавливаем рабочий каталог
WORKDIR /app

# Копируем requirements.txt и устанавливаем зависимости
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Копируем исходный код
COPY . .

# Открываем порт для приложения
EXPOSE 8000

# Запускаем сервер с Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "myproject.wsgi:application"]
