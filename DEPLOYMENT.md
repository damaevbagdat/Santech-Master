# Инструкция по деплою Santech-Master

## 1. Создание GitHub репозитория

### Вариант A: Через веб-интерфейс GitHub

1. Откройте [github.com](https://github.com)
2. Нажмите "+" → "New repository"
3. Заполните:
   - **Repository name**: `Santech-Master`
   - **Description**: Сайт сантехнических услуг в Алматы
   - **Public** или **Private** (на ваш выбор)
   - ⚠️ **НЕ** ставьте галочки "Add README" и "Add .gitignore"
4. Нажмите "Create repository"

5. На следующей странице скопируйте команды из раздела "push an existing repository"

6. Выполните в терминале в папке проекта:
```bash
cd "c:\Users\damae\OneDrive\Документы\GitHub\Santech-Master"
git remote add origin https://github.com/ВАШ-USERNAME/Santech-Master.git
git branch -M main
git push -u origin main
```

## 2. Деплой на Vercel (Рекомендуется)

### Почему Vercel?
- Бесплатный SSL сертификат
- Автоматический деплой при push в GitHub
- Поддержка пользовательских доменов
- Отличная производительность

### Шаги:

1. **Зарегистрируйтесь на Vercel**
   - Откройте [vercel.com](https://vercel.com)
   - Нажмите "Sign Up"
   - Выберите "Continue with GitHub"

2. **Импортируйте проект**
   - Нажмите "Add New..." → "Project"
   - Найдите репозиторий `Santech-Master`
   - Нажмите "Import"

3. **Настройте проект**
   - **Framework Preset**: Astro
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - Нажмите "Deploy"

4. **Подождите деплоя** (1-2 минуты)

5. **Получите ссылку**
   - После деплоя вы получите ссылку вида: `santech-master.vercel.app`
   - Сайт доступен!

## 3. Настройка домена santech-master.com

### На Vercel:

1. **Откройте настройки проекта**
   - В Vercel перейдите в проект
   - Settings → Domains

2. **Добавьте домен**
   - Введите `santech-master.com`
   - Нажмите "Add"

3. **Vercel покажет DNS записи**, которые нужно добавить:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Настройка DNS (на регистраторе домена):

1. **Войдите в панель управления доменом**
   - Где зарегистрирован домен (например, Beget, Nic.ru, GoDaddy)

2. **Найдите раздел DNS управления**
   - Обычно называется "DNS Settings", "DNS Management" или "DNS записи"

3. **Удалите старые A и CNAME записи** (если есть)

4. **Добавьте новые записи** (которые показал Vercel):
   ```
   Type: A
   Host: @
   Points to: 76.76.21.21
   TTL: Automatic (или 3600)

   Type: CNAME
   Host: www
   Points to: cname.vercel-dns.com
   TTL: Automatic (или 3600)
   ```

5. **Сохраните изменения**

6. **Подождите** 1-24 часа (обычно 1-2 часа)
   - DNS изменения распространяются не сразу

7. **Проверьте**
   - Откройте `santech-master.com` в браузере
   - Должен открыться ваш сайт с SSL (https://)

## 4. Альтернатива: Деплой на Netlify

1. **Зарегистрируйтесь на [netlify.com](https://netlify.com)**

2. **Импортируйте проект**
   - "Add new site" → "Import an existing project"
   - Выберите GitHub → `Santech-Master`

3. **Настройки сборки**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - Нажмите "Deploy"

4. **Настройка домена**
   - Site settings → Domain management → Add custom domain
   - Следуйте инструкциям (аналогично Vercel)

## 5. Обновление контента

После деплоя, любые изменения в коде автоматически обновят сайт:

```bash
# 1. Внесите изменения в код
# 2. Закоммитьте
git add .
git commit -m "Update: описание изменений"

# 3. Запуште на GitHub
git push origin main

# 4. Vercel/Netlify автоматически задеплоят изменения (1-2 мин)
```

## 6. Что дальше?

### Добавить логотип:
1. Положите файл `logo.png` в папку `public/`
2. Обновите `src/components/Header.astro`:
   ```astro
   <img src="/logo.png" alt="Santech-Master" class="logo-img">
   ```

### Добавить изображения услуг:
- Положите изображения в `public/images/`
- Добавьте в карточки услуг

### Настроить формы:
- Используйте Formspree, Netlify Forms или другой сервис
- Добавьте Cloudflare Turnstile для защиты от ботов

### Обновить контакты:
- Замените `+77000000000` на реальный номер
- Обновите ссылку WhatsApp

### SEO оптимизация:
- Добавьте `robots.txt` в `public/`
- Настройте `sitemap.xml` (уже настроен в `astro.config.mjs`)
- Добавьте Open Graph теги в `BaseLayout.astro`

## Поддержка

По вопросам обращайтесь к разработчику или в Issues на GitHub.
