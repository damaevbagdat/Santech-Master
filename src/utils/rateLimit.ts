// Rate Limiting для защиты от спама
// Хранит IP адреса и время последних запросов

interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastAttempt: number;
}

// Хранилище в памяти (для production лучше использовать Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Настройки rate limiting
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 минут в миллисекундах
const MAX_REQUESTS = 3; // Максимум 3 запроса за окно
const MIN_REQUEST_INTERVAL = 30 * 1000; // Минимум 30 секунд между запросами

// Очистка старых записей каждые 30 минут
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 30 * 60 * 1000);

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry) {
    // Первый запрос от этого IP
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
      lastAttempt: now,
    });
    return { allowed: true };
  }

  // Проверка минимального интервала между запросами
  if (now - entry.lastAttempt < MIN_REQUEST_INTERVAL) {
    const retryAfter = Math.ceil((MIN_REQUEST_INTERVAL - (now - entry.lastAttempt)) / 1000);
    return { allowed: false, retryAfter };
  }

  // Сброс счетчика если окно истекло
  if (now > entry.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
      lastAttempt: now,
    });
    return { allowed: true };
  }

  // Проверка превышения лимита
  if (entry.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Увеличиваем счетчик
  entry.count++;
  entry.lastAttempt = now;
  rateLimitStore.set(ip, entry);

  return { allowed: true };
}

export function getClientIP(request: Request): string {
  // Попытка получить реальный IP через заголовки прокси
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback - не идеально, но работает для базовой защиты
  return 'unknown';
}
