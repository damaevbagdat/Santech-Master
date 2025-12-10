# Инструкция по деплою сайта на ps.kz (Shared Hosting)

## Обзор изменений

Сайт был конвертирован из SSR (Server-Side Rendering) режима в статический режим для совместимости с shared hosting на ps.kz.

### Что изменилось:
1. **Astro config**: `output: 'server'` → `output: 'static'`
2. **Контактная форма**: Переключена с `/api/contact` на Web3Forms (внешний сервис)
3. **Структура**: Теперь сайт состоит из статических HTML/CSS/JS файлов

## Шаг 1: Регистрация на Web3Forms

Контактная форма теперь использует бесплатный сервис Web3Forms.

1. Перейдите на: https://web3forms.com
2. Зарегистрируйтесь (бесплатно)
3. Создайте новый Access Key
4. Скопируйте полученный Access Key

## Шаг 2: Настройка Web3Forms Access Key

### Вариант А: Локальная разработка
Создайте файл `.env` в корне проекта (если еще не создан):

```env
PUBLIC_WEB3FORMS_ACCESS_KEY=ваш_access_key_здесь
```

### Вариант Б: Прямая вставка в код (для production)
Откройте файл `src/components/ContactForm.astro` и замените строку:

```typescript
const WEB3FORMS_ACCESS_KEY = import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY || 'YOUR_ACCESS_KEY_HERE';
```

На:

```typescript
const WEB3FORMS_ACCESS_KEY = 'ваш_реальный_access_key';
```

## Шаг 3: Сборка статического сайта

```bash
cd "c:\Users\damae\OneDrive\Документы\GitHub\Santech-Master"
npm run build
```

После сборки все файлы будут в папке `dist/`

## Шаг 4: Загрузка файлов на ps.kz через FTP

### Получение FTP данных:
1. Войдите в панель управления ps.kz (srv-plesk45.ps.kz)
2. Перейдите в раздел "Файлы" или "FTP"
3. Скопируйте FTP данные:
   - **Хост**: обычно `ftp.santech-master.com` или `195.210.46.30`
   - **Логин**: `santechm` (или ваш логин)
   - **Пароль**: ваш пароль от хостинга
   - **Порт**: 21 (обычный FTP) или 22 (SFTP)

### Загрузка через FileZilla (рекомендуется):

1. Скачайте FileZilla Client: https://filezilla-project.org/download.php?type=client
2. Установите и запустите FileZilla
3. Введите данные подключения:
   ```
   Хост: ftp.santech-master.com
   Логин: santechm
   Пароль: ваш_пароль
   Порт: 21
   ```
4. Нажмите "Быстрое соединение"
5. В правой панели найдите папку `httpdocs` или `public_html` (корневая папка сайта)
6. **ВАЖНО: Удалите все старые файлы из этой папки** (или создайте backup)
7. В левой панели перейдите в папку `dist` вашего проекта
8. Выделите ВСЕ файлы из папки `dist` и перетащите их в правую панель (в корень сайта)

### Структура файлов на сервере должна быть:
```
httpdocs/ (или public_html/)
├── index.html
├── ru/
│   └── index.html
├── kz/
│   └── index.html
├── en/
│   └── index.html
├── images/
│   ├── service-1.png
│   ├── service-2.png
│   ├── service-3.png
│   ├── service-4.png
│   └── service-5.png
├── _astro/
│   └── index.C95RCvMK.css
├── logo.png
├── favicon.svg
├── robots.txt
├── sitemap-index.xml
└── sitemap-0.xml
```

## Шаг 5: Настройка перенаправления на /ru/ (опционально)

Если хотите, чтобы главная страница автоматически открывала `/ru/`, создайте файл `.htaccess` в корне:

```apache
# Redirect root to /ru/
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/$
RewriteRule ^(.*)$ /ru/ [R=301,L]

# Disable directory listing
Options -Indexes

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/html "access plus 1 day"
</IfModule>
```

## Шаг 6: Настройка Email уведомлений в Web3Forms

1. Войдите в панель Web3Forms
2. Перейдите в настройки вашего Access Key
3. Укажите email, на который будут приходить заявки
4. (Опционально) Настройте интеграцию с Telegram:
   - В Web3Forms можно настроить webhook
   - URL webhook: `https://api.telegram.org/bot<ваш_telegram_bot_token>/sendMessage`
   - Метод: POST
   - Payload: настройте по инструкции Web3Forms

## Шаг 7: Проверка работы

1. Откройте сайт: https://santech-master.com
2. Проверьте все языковые версии:
   - https://santech-master.com/ru/
   - https://santech-master.com/kz/
   - https://santech-master.com/en/
3. Проверьте контактную форму:
   - Заполните форму тестовыми данными
   - Отправьте
   - Убедитесь, что заявка пришла на ваш email

## Шаг 8: Настройка DNS (если еще не настроено)

Если домен santech-master.com еще не указывает на новый хостинг:

1. Войдите в панель управления доменом (где купили домен)
2. Найдите раздел DNS или Name Servers
3. Измените A-запись:
   ```
   Тип: A
   Имя: @
   Значение: 195.210.46.30
   TTL: 3600
   ```
4. Также добавьте запись для www:
   ```
   Тип: A
   Имя: www
   Значение: 195.210.46.30
   TTL: 3600
   ```
5. Сохраните изменения
6. Подождите 1-24 часа (обычно 1-2 часа) для распространения DNS

## Отличия от старого сервера (VPS)

| Характеристика | Старый VPS (194.32.142.237) | Новый Shared (ps.kz) |
|----------------|------------------------------|----------------------|
| Тип хостинга | VPS с Node.js | Shared hosting |
| Деплой | SSH + Git + PM2 | FTP + Static files |
| Контактная форма | API endpoint (Telegram bot) | Web3Forms (external) |
| Режим Astro | SSR (Server) | Static |
| Обновление | `git pull && npm run build && pm2 restart` | FTP загрузка dist/ |

## Обновление сайта в будущем

Когда нужно внести изменения:

1. Внесите изменения в код локально
2. Соберите статический сайт:
   ```bash
   npm run build
   ```
3. Подключитесь по FTP к ps.kz
4. Загрузите обновленные файлы из `dist/` на сервер
5. Готово!

## Troubleshooting

### Проблема: Форма не отправляется
**Решение**:
- Проверьте Web3Forms Access Key в `ContactForm.astro`
- Проверьте консоль браузера (F12) на ошибки
- Убедитесь, что в Web3Forms настроен email получателя

### Проблема: Сайт не открывается
**Решение**:
- Проверьте, что файлы загружены в правильную папку (httpdocs или public_html)
- Проверьте, что файл `index.html` есть в корне
- Проверьте DNS записи домена

### Проблема: Изображения не загружаются
**Решение**:
- Убедитесь, что папка `images/` загружена на сервер
- Проверьте права доступа к файлам (должны быть 644 для файлов, 755 для папок)

### Проблема: CSS не применяется
**Решение**:
- Убедитесь, что папка `_astro/` загружена на сервер
- Очистите кеш браузера (Ctrl + F5)
- Проверьте консоль браузера на ошибки 404

## Контакты для поддержки

- **Web3Forms Support**: https://web3forms.com/support
- **ps.kz Support**: https://ps.kz/support
- **Telegram для связи с владельцем**: +7 (775) 471-01-29

## Бэкап старого сервера

Старый сервер (VPS) пока работает по адресу: 194.32.142.237
Рекомендуется сохранить его работающим еще 1-2 недели как бэкап, пока новый хостинг не будет полностью протестирован.

После успешного переноса можно будет:
1. Остановить PM2: `pm2 stop santech-master`
2. Удалить проект с VPS (опционально)
3. Использовать VPS для других проектов
