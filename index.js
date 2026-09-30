const axios = require('axios');
const cheerio = require('cheerio');

// ================= НАСТРОЙКИ ПОЛЬЗОВАТЕЛЯ =================
const TELEGRAM_TOKEN = '8095092747:AAElTvTHloYOuHmbRwRb2NeIlLRCxvCX65A'; // Ваш токен бота
const CHAT_ID = '541538070'; // Ваш личный ID в Telegram
const CHECK_INTERVAL = 60000; // Проверять Ozon раз в 60 секунд (1 минуту)

// ВШИТА ВАША ССЫЛКА НА ГЛАВНУЮ СТРАНИЦУ
const OZON_URL = 'https://www.ozon.ru/?__rr=2&abt_att=1&origin_referer=www.ozon.ru'; 
// ==========================================================

const sentItems = new Set();

async function sendTelegramMessage(text) {
    const url = `https://telegram.org\${TELEGRAM_TOKEN}/sendMessage`;
    try {
        await axios.post(url, {
            chat_id: CHAT_ID,
            text: text,
            parse_mode: 'Markdown'
        });
    } catch (error) {
        console.error('Ошибка отправки в Telegram:', error.message);
    }
}

async function checkOzon() {
    console.log('Облачный сервер сканирует Ozon на наличие товаров...');
    try {
        const response = await axios.get(OZON_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'ru-RU,ru;q=0.9'
            }
        });

        const \$ = cheerio.load(response.data);
        
        // Перебираем все возможные контейнеры и блоки товаров
        \$('div, section, article').each((i, elem) => {
            const textContent = \$(elem).text().toLowerCase();
            
            // ТЕСТОВЫЙ РЕЖИМ: Шлём первый попавшийся товар, чтобы проверить, что облако достучалось до вашего VPgram
            const has100Percent = true || textContent.includes('100%') || textContent.includes('кешбэк');

            if (has100Percent) {
                const linkElement = \$(elem).find('a[href*="/product/"]');
                if (!linkElement.length) return;

                let href = linkElement.attr('href');
                if (!href) return;

                // Собираем правильную прямую ссылку на товар
                let link = href.startsWith('http') ? href : 'https://www.ozon.ru' + href;
                if (link.includes('?')) link = link.split('?')[0];

                // Вытаскиваем имя товара
                let title = linkElement.text().trim() || \$(elem).find('span, p').first().text().trim() || 'Товар с Ozon';
                title = title.replace(/\s+/g, ' ').substring(0, 60);

                if (!sentItems.has(link) && title.length > 5) {
                    const message = `🚨 *Облачный сервер успешно запустился!*\\n\\n📦 *Товар:* \${title}\\n\\n🔗 [Открыть на Ozon](\${link})`;
                    sendTelegramMessage(message);
                    sentItems.add(link);
                    console.log(`[Успех] Найдено и отправлено в Telegram: \${title}`);
                }
            }
        });
    } catch (error) {
        console.error('Ошибка при сканировании Ozon:', error.message);
    }
}

// Запуск постоянного круглосуточного мониторинга
setInterval(checkOzon, CHECK_INTERVAL);
checkOzon();
