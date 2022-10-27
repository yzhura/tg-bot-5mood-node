require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const webApp = "https://regal-bonbon-664a6e.netlify.app";
const token = process.env.TG_TOKEN;

const bot = new TelegramBot(token, { polling: true });

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message
  
    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"
  
    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    // console.log('chatId: ', chatId);
    const text = msg.text;
  
    if (text === "/start") {
      await bot.sendMessage(
        chatId,
        "Тицніть зліва на кнопку 'Сайт' щоб оформити замовлення",
        {
          reply_markup: {
            // keyboard: [[{ text: "Розмірна сітка", web_app: { url: webApp } }]],
            keyboard: [[{ text: "Розмірна сітка" }]],
          },
        }
      );
    }
  
    if (text === "Розмірна сітка") {
      await bot.sendMessage(
        chatId,
        `Наша розмірна сітка підгрудного корсету: 
        \n- XS (32) на Обхват талії 58-67см 
        \n- S (34) на Обхват талиії 68-72см 
        \n- M (36-38) на Обхват талії 73-77см 
        \n- L (40) на Обхват Талиії 78-82см 
        \n- XL (42-44) на Обхват Талії  83-87см 
        \n- 2XL (44-46) на Обхват талії  88-92см 
        \n- 3XL (46-48) на Обхват талії 93-97см`
      );
    }
  
    // send a message to the chat acknowledging receipt of their message
    // bot.sendMessage(chatId, "Шо ты хочешь? Корсетов нет! Закончились");
});


module.exports = bot;