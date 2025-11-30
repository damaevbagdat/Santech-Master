# Настройка автоматического деплоя через GitHub Actions

После каждого `git push` в ветку `main`, сайт будет автоматически обновляться на сервере.

---

## Шаг 1: Настройка GitHub Secrets

Нужно добавить 3 секретных ключа в настройках GitHub репозитория:

### 1. Откройте настройки репозитория

1. Перейдите на https://github.com/damaevbagdat/Santech-Master
2. Нажмите **Settings** (Настройки)
3. В левом меню выберите **Secrets and variables** → **Actions**
4. Нажмите **New repository secret**

### 2. Добавьте три секрета

#### Секрет 1: VPS_HOST
- **Name:** `VPS_HOST`
- **Value:** `213.130.74.133`
- Нажмите **Add secret**

#### Секрет 2: VPS_USERNAME
- **Name:** `VPS_USERNAME`
- **Value:** `ubuntu`
- Нажмите **Add secret**

#### Секрет 3: VPS_SSH_KEY
- **Name:** `VPS_SSH_KEY`
- **Value:** Содержимое файла `Kamila-key.pem`

Чтобы получить содержимое ключа:

**В PowerShell:**
```powershell
Get-Content "C:\Users\damae\OneDrive\Документы\GitHub\2-Project\Kamila-key.pem"
```

Скопируйте **ВСЁ** содержимое (включая строки `-----BEGIN RSA PRIVATE KEY-----` и `-----END RSA PRIVATE KEY-----`) и вставьте в поле **Value**.

Нажмите **Add secret**

---

## Шаг 2: Первичная настройка сервера

**Эти команды нужно выполнить ОДИН РАЗ на сервере:**

### 2.1 Подключитесь к серверу

```powershell
ssh -i "C:\Users\damae\OneDrive\Документы\GitHub\2-Project\Kamila-key.pem" ubuntu@213.130.74.133
```

### 2.2 Установите необходимое ПО

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Nginx
sudo apt install nginx -y

# Установка Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PM2
sudo npm install -g pm2

# Установка Certbot для SSL
sudo apt install certbot python3-certbot-nginx -y

# Установка Git (если еще не установлен)
sudo apt install git -y
```

### 2.3 Клонируйте репозиторий

```bash
# Создание директории
sudo mkdir -p /var/www/santech-master
sudo chown -R ubuntu:ubuntu /var/www/santech-master

# Клонирование
cd /var/www/santech-master
git clone https://github.com/damaevbagdat/Santech-Master.git .

# Настройка Git (для автодеплоя)
git config pull.rebase false
```

### 2.4 Создайте .env файл

```bash
nano .env
```

Вставьте:
```
TELEGRAM_BOT_TOKEN=8597371163:AAGnoWQkEzj7LY5Z7Fl6uUISRLoxFoDzNV0
TELEGRAM_CHAT_ID=
TURNSTILE_SITE_KEY=0x4AAAAAACDsiVve-ZtwjI5L
TURNSTILE_SECRET_KEY=0x4AAAAAACDsiXAP57yrrASU7-KKzqHo9gc
```

Сохраните: `Ctrl+X`, `Y`, `Enter`

### 2.5 Установите зависимости и соберите проект

```bash
npm install
npm run build
```

### 2.6 Запустите PM2

```bash
pm2 start npm --name "santech-master" -- run preview -- --port 4321 --host 0.0.0.0
pm2 save
pm2 startup
# Выполните команду которую выдаст pm2 startup (начинается с sudo)
```

### 2.7 Настройте Nginx

```bash
sudo nano /etc/nginx/sites-available/santech-master
```

Вставьте:
```nginx
server {
    listen 80;
    listen [::]:80;

    server_name santech-master.com www.santech-master.com;

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

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:4321;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    server_tokens off;
}
```

Сохраните: `Ctrl+X`, `Y`, `Enter`

```bash
# Активация конфигурации
sudo ln -s /etc/nginx/sites-available/santech-master /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Проверка и перезапуск
sudo nginx -t
sudo systemctl restart nginx
```

### 2.8 Установите SSL сертификат

```bash
sudo certbot --nginx -d santech-master.com -d www.santech-master.com
```

Следуйте инструкциям certbot.

### 2.9 Сделайте deploy.sh исполняемым

```bash
cd /var/www/santech-master
chmod +x deploy.sh
```

---

## Шаг 3: Тестирование автодеплоя

### 3.1 Сделайте тестовое изменение

На вашем компьютере:

```powershell
cd "C:\Users\damae\OneDrive\Документы\GitHub\Santech-Master"

# Сделайте любое изменение, например:
# echo "<!-- Test auto-deploy -->" >> src/pages/index.astro

git add .
git commit -m "test: check auto-deploy"
git push
```

### 3.2 Проверьте GitHub Actions

1. Откройте https://github.com/damaevbagdat/Santech-Master/actions
2. Вы должны увидеть запущенный workflow **Deploy to VPS**
3. Дождитесь завершения (обычно 2-3 минуты)
4. Если есть зеленая галочка ✅ - деплой прошел успешно!

### 3.3 Проверьте сайт

Откройте https://santech-master.com и проверьте что изменения применились.

---

## Шаг 4: Ручной деплой (если нужно)

Если по какой-то причине автодеплой не сработал, можно запустить вручную:

```bash
# Подключитесь к серверу
ssh -i "C:\Users\damae\OneDrive\Документы\GitHub\2-Project\Kamila-key.pem" ubuntu@213.130.74.133

# Запустите скрипт деплоя
cd /var/www/santech-master
./deploy.sh
```

---

## Как работает автодеплой

При каждом `git push` в ветку `main`:

1. **GitHub Actions** запускает workflow
2. Код собирается на GitHub серверах
3. GitHub подключается к вашему VPS по SSH
4. На сервере выполняются команды:
   - `git pull` - загрузка последних изменений
   - `npm ci` - установка зависимостей
   - `npm run build` - сборка проекта
   - `pm2 restart` - перезапуск сервера
5. Сайт обновляется автоматически!

---

## Решение проблем

### Деплой падает с ошибкой в GitHub Actions

1. Проверьте логи в https://github.com/damaevbagdat/Santech-Master/actions
2. Убедитесь что все 3 секрета добавлены правильно
3. Проверьте что SSH ключ скопирован полностью (включая заголовки)

### Сайт не обновляется после деплоя

```bash
# На сервере
pm2 logs santech-master
pm2 restart santech-master
```

### PM2 показывает ошибки

```bash
# Проверьте логи
pm2 logs santech-master --lines 50

# Перезапуск
cd /var/www/santech-master
npm run build
pm2 restart santech-master
```

---

## Полезные команды

```bash
# Просмотр статуса
pm2 status

# Просмотр логов
pm2 logs santech-master

# Ручной деплой
cd /var/www/santech-master
./deploy.sh

# Перезапуск Nginx
sudo systemctl restart nginx

# Проверка SSL
sudo certbot certificates
```

---

**Готово! Теперь при каждом `git push` сайт будет автоматически обновляться! 🎉**
