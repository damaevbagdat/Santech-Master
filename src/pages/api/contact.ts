import type { APIRoute } from 'astro';
import { checkRateLimit, getClientIP } from '../../utils/rateLimit';
import { verifyTurnstileToken } from '../../utils/turnstile';

const TELEGRAM_BOT_TOKEN = import.meta.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.TELEGRAM_CHAT_ID;
const TURNSTILE_SECRET_KEY = import.meta.env.TURNSTILE_SECRET_KEY;

// Функция для отправки сообщения в Telegram
async function sendTelegramMessage(chatId: string, message: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
    return false;
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Проверка конфигурации
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Telegram credentials not configured');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Сервис временно недоступен'
        }),
        { status: 500 }
      );
    }

    // 2. Rate Limiting - защита от спама по IP
    const clientIP = getClientIP(request);
    const rateLimitCheck = checkRateLimit(clientIP);

    if (!rateLimitCheck.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Слишком много запросов. Попробуйте через ${rateLimitCheck.retryAfter} секунд.`
        }),
        {
          status: 429,
          headers: {
            'Retry-After': rateLimitCheck.retryAfter?.toString() || '60'
          }
        }
      );
    }

    const data = await request.json();
    const { name, phone, message: userMessage, honeypot, turnstileToken } = data;

    // 3. Honeypot проверка - ловушка для ботов
    if (honeypot) {
      console.log('Bot detected via honeypot field');
      // Возвращаем успех, чтобы бот не понял что его поймали
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Заявка принята'
        }),
        { status: 200 }
      );
    }

    // 4. Cloudflare Turnstile проверка (если настроен)
    if (TURNSTILE_SECRET_KEY && TURNSTILE_SECRET_KEY !== 'your_secret_key_here') {
      if (!turnstileToken) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Пожалуйста, подтвердите что вы не робот'
          }),
          { status: 400 }
        );
      }

      const isValidToken = await verifyTurnstileToken(turnstileToken, TURNSTILE_SECRET_KEY);
      if (!isValidToken) {
        console.log('Invalid Turnstile token from IP:', clientIP);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Проверка безопасности не пройдена. Попробуйте еще раз.'
          }),
          { status: 400 }
        );
      }
    }

    // Валидация данных
    if (!name || !phone) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Имя и телефон обязательны для заполнения'
        }),
        { status: 400 }
      );
    }

    // Формируем текст сообщения
    const telegramMessage = `
🔔 <b>Новая заявка с сайта Santech-Master</b>

👤 <b>Имя:</b> ${name}
📱 <b>Телефон:</b> ${phone}
${userMessage ? `💬 <b>Сообщение:</b>\n${userMessage}` : ''}

⏰ <b>Дата:</b> ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' })}
    `.trim();

    // Отправляем сообщение в Telegram
    const sent = await sendTelegramMessage(TELEGRAM_CHAT_ID, telegramMessage);

    if (sent) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Ваша заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.'
        }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Не удалось отправить сообщение. Пожалуйста, попробуйте позже.'
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже.'
      }),
      { status: 500 }
    );
  }
};
