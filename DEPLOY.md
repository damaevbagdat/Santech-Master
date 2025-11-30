# Инструкция по деплою Santech-Master на VPS

**Сервер:** 213.130.74.133
**Домен:** santech-master.com

## Предварительные требования

Перед началом убедитесь:
- У вас есть SSH доступ к серверу (логин/пароль или .pem ключ)
- Домен santech-master.com указывает на IP 213.130.74.133

---

## Шаг 1: Подключение к серверу

### С помощью пароля:
```bash
ssh root@213.130.74.133
```

### С помощью .pem ключа:
```bash
ssh -i путь/к/ключу.pem root@213.130.74.133
```

---

## Шаг 2: Установка необходимого ПО на сервере

После подключения выполните команды:

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Nginx
sudo apt install nginx -y

# Установка Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PM2 (для управления Node.js процессом)
sudo npm install -g pm2

# Установка Certbot для SSL
sudo apt install certbot python3-certbot-nginx -y

# Проверка установки
nginx -v
node --version
npm --version
pm2 --version
```

---

## Шаг 3: Создание директории для сайта

```bash
# Создаем директорию для сайта
sudo mkdir -p /var/www/santech-master
sudo chown -R $USER:$USER /var/www/santech-master
```

---

## Шаг 4: Загрузка файлов на сервер

### Вариант А: С помощью Git (РЕКОМЕНДУЕТСЯ)

```bash
# На сервере
cd /var/www/santech-master
git clone https://github.com/damaevbagdat/Santech-Master.git .

# Установка зависимостей
npm install

# Создание .env файла
nano .env
```

Скопируйте в .env следующее содержимое:
```
TELEGRAM_BOT_TOKEN=8597371163:AAGnoWQkEzj7LY5Z7Fl6uUISRLoxFoDzNV0
TELEGRAM_CHAT_ID=
TURNSTILE_SITE_KEY=0x4AAAAAACDsiVve-ZtwjI5L
TURNSTILE_SECRET_KEY=0x4AAAAAACDsiXAP57yrrASU7-KKzqHo9gc
```

Сохраните файл: `Ctrl+X`, затем `Y`, затем `Enter`

```bash
# Сборка проекта
npm run build
```

### Вариант Б: С помощью SCP (передача файлов)

**На вашем Windows компьютере в PowerShell:**
```powershell
cd "C:\Users\damae\OneDrive\Документы\GitHub\Santech-Master"

# Передача файлов dist/ на сервер
scp -r dist/* root@213.130.74.133:/var/www/santech-master/
```

---

## Шаг 5: Запуск Astro SSR сервера

Поскольку у вас есть API endpoint (`/api/contact`), нужно запустить Node.js сервер:

```bash
cd /var/www/santech-master

# Запуск сервера с PM2
pm2 start npm --name "santech-master" -- run preview -- --port 4321 --host 0.0.0.0

# Сохранение конфигурации PM2
pm2 save
pm2 startup

# Проверка статуса
pm2 status
pm2 logs santech-master
```

---

## Шаг 6: Настройка Nginx

```bash
# Создание конфигурационного файла Nginx
sudo nano /etc/nginx/sites-available/santech-master
```

Вставьте следующую конфигурацию:
```nginx
server {
    listen 80;
    listen [::]:80;

    server_name santech-master.com www.santech-master.com;

    # Проксирование всех запросов к Astro серверу
    location / {
        proxy_pass http://localhost:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Кеширование статических файлов
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:4321;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    server_tokens off;

    access_log /var/log/nginx/santech-master-access.log;
    error_log /var/log/nginx/santech-master-error.log;
}
```

Сохраните файл: `Ctrl+X`, затем `Y`, затем `Enter`

```bash
# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/santech-master /etc/nginx/sites-enabled/

# Удаление дефолтной конфигурации
sudo rm /etc/nginx/sites-enabled/default

# Проверка конфигурации Nginx
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx

# Проверка статуса
sudo systemctl status nginx
```

---

## Шаг 7: Настройка DNS

В панели управления доменом (где купили santech-master.com) добавьте:

**A-запись:**
- Тип: `A`
- Имя: `@`
- Значение: `213.130.74.133`
- TTL: `3600`

**A-запись для www:**
- Тип: `A`
- Имя: `www`
- Значение: `213.130.74.133`
- TTL: `3600`

**Проверка DNS (на вашем компьютере):**
```bash
nslookup santech-master.com
nslookup www.santech-master.com
```

DNS может обновиться в течение 1-24 часов.

---

## Шаг 8: Установка SSL сертификата (HTTPS)

После того как DNS обновится:

```bash
# Получение SSL сертификата
sudo certbot --nginx -d santech-master.com -d www.santech-master.com

# Следуйте инструкциям:
# - Введите email
# - Согласитесь с условиями (Y)
# - Выберите перенаправление HTTP на HTTPS (2)

# Автообновление сертификата
sudo certbot renew --dry-run
```

---

## Шаг 9: Проверка работы

Откройте в браузере:
- http://santech-master.com (должен перенаправить на https://)
- https://santech-master.com

Проверьте:
- ✅ Главная страница загружается
- ✅ Картинки отображаются
- ✅ Форма обратной связи работает
- ✅ Плавающие кнопки WhatsApp и Позвонить работают
- ✅ SSL сертификат активен (замок в браузере)

---

## Обновление сайта в будущем

Когда вы внесете изменения в код:

```bash
# На вашем компьютере
cd "C:\Users\damae\OneDrive\Документы\GitHub\Santech-Master"
git add .
git commit -m "Описание изменений"
git push

# На сервере
cd /var/www/santech-master
git pull
npm install  # если добавили новые зависимости
npm run build
pm2 restart santech-master
```

---

## Полезные команды

```bash
# Просмотр логов сервера
pm2 logs santech-master

# Просмотр логов Nginx
sudo tail -f /var/log/nginx/santech-master-error.log
sudo tail -f /var/log/nginx/santech-master-access.log

# Перезапуск сервера
pm2 restart santech-master

# Остановка сервера
pm2 stop santech-master

# Перезапуск Nginx
sudo systemctl restart nginx

# Проверка статуса Nginx
sudo systemctl status nginx

# Проверка портов
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :4321
```

---

## Решение проблем

### Сайт не открывается

```bash
# Проверка запущен ли Node.js сервер
pm2 status

# Если не запущен
cd /var/www/santech-master
pm2 start npm --name "santech-master" -- run preview -- --port 4321 --host 0.0.0.0

# Проверка запущен ли Nginx
sudo systemctl status nginx

# Если не запущен
sudo systemctl start nginx
```

### Форма не отправляет сообщения в Telegram

```bash
# Проверка логов
pm2 logs santech-master

# Проверка .env файла
cat /var/www/santech-master/.env

# Перезапуск после изменения .env
pm2 restart santech-master
```

### SSL не работает

```bash
# Проверка сертификата
sudo certbot certificates

# Обновление сертификата
sudo certbot renew
sudo systemctl reload nginx
```

---

## Контакты для поддержки

Если возникли проблемы:
1. Проверьте логи: `pm2 logs santech-master`
2. Проверьте Nginx логи: `sudo tail -f /var/log/nginx/santech-master-error.log`
3. Убедитесь что DNS настроен правильно: `nslookup santech-master.com`

---

**Готово! Ваш сайт должен работать на https://santech-master.com**
