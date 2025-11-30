import type { APIRoute } from 'astro';

const TELEGRAM_BOT_TOKEN = import.meta.env.TELEGRAM_BOT_TOKEN || '8597371163:AAGnoWQkEzj7LY5Z7Fl6uUISRLoxFoDzNV0';
const TELEGRAM_CHAT_ID = '1243618822'; // Chat ID владельца бота

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
    const data = await request.json();
    const { name, phone, message: userMessage } = data;

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
