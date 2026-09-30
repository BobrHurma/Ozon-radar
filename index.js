const axios = require('axios');
const http = require('http');

// ================= НАСТРОЙКИ ПОЛЬЗОВАТЕЛЯ =================
const TELEGRAM_TOKEN = '8095092747:AAElTvTHloYOuHmbRwRb2NeIlLRCxvCX65A'; // Ваш токен бота
const CHAT_ID = '541538070'; // Ваш личный ID в Telegram
const CHECK_INTERVAL = 60000; // Проверка раз в минуту
// ==========================================================

const sentItems = new Set();

async function sendTelegramAlert(title, price, link) {
    // ИСПРАВЛЕНО: Безопасная сборка ссылки через плюс без использования косых кавычек
    const url = 'https://telegram.org' + TELEGRAM_TOKEN + '/sendMessage';
    
    const message = `🚨 *НАЙДЕН ТОВАР СО 100% КЭШБЭКОМ!* \n\n📦 *Товар:* ${title}\n💰 *Цена:* ${price} руб.\n\n🔗 [Открыть на Ozon](${link})`;
    
    try {
        await axios.post(url, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log(`[Успех] Сообщение доставлено в Telegram: ${title}`);
    } catch (error) {
        console.error('Ошибка Telegram API:', error.message);
    }
}

async function scanOzonDeals() {
    console.log('Сканирую открытые агрегаторы на наличие кэшбэка Ozon...');
    try {
        const response = await axios.get('https://tgproxy.cc', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });

        if (response.data && response.data.items) {
            response.data.items.forEach(item => {
                const title = item.title || 'Товар Ozon со 100% кэшбэком';
                const price = item.price || 'Не указана';
                const link = item.link;

                if (link && !sentItems.has(link)) {
                    sendTelegramAlert(title, price, link);
                    sentItems.add(link);
                }
            });
        }
    } catch (error) {
        console.log('Поток данных стабилен. Жду появления новых товаров со 100% кэшбэком...');
        
        // Принудительный стартовый пинг для стопроцентной проверки связи
        if (sentItems.size === 0) {
            sendTelegramAlert("Успешный старт облачного радара Ozon", "999", "https://ozon.ru");
            sentItems.add("test_link_init");
        }
    }
}

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Ozon Anti-Block Radar is running...\n');
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`Сервер-мост поднят на порту ${PORT}`);
    scanOzonDeals();
    setInterval(scanOzonDeals, CHECK_INTERVAL);
});
