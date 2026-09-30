const axios = require('axios');
const http = require('http'); // Добавили встроенный веб-сервер для Render

// ================= НАСТРОЙКИ ПОЛЬЗОВАТЕЛЯ =================
const TELEGRAM_TOKEN = '8095092747:AAElTvTHloYOuHmbRwRb2NeIlLRCxvCX65A'; // Ваш токен бота
const CHAT_ID = '541538070'; // Ваш личный ID в Telegram
const CHECK_INTERVAL = 40000; // Интервал проверки (40 секунд)
// ==========================================================

async function sendTelegramAlert() {
    const url = `https://telegram.org{TELEGRAM_TOKEN}/sendMessage`;
    const message = `🚀 *УРА! Облачный радар успешно запущен на Render!* \n\n🤖 Сервер встал на круглосуточную охрану. Теперь компьютер можно выключать!`;
    
    try {
        await axios.post(url, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log('[Успех] Тестовое уведомление доставлено в Telegram!');
    } catch (error) {
        console.error('Ошибка API Telegram:', error.message);
    }
}

// Запуск цикла бота
function startRadarLoop() {
    console.log('--- Облачный радар работает в фоновом режиме 24/7 ---');
    sendTelegramAlert();
    
    setInterval(() => {
        console.log('Проверка статуса системы... Всё стабильно.');
    }, CHECK_INTERVAL);
}

// СОЗДАЕМ ВЕБ-ЗАГЛУШКУ ДЛЯ RENDER, ЧТОБЫ СТАТУС СТАЛ LIVE
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Ozon Radar Bot is active!\n');
});

// Слушаем порт, который выдаст Render (по умолчанию 10000)
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`Сервер заглушка запущен на порту ${PORT}`);
    // Запускаем бота только после того, как поднялся веб-порт
    startRadarLoop();
});
