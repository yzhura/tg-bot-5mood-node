require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");

const token = process.env.TG_TOKEN;
const webApp = "https://regal-bonbon-664a6e.netlify.app";
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

const app = express();

app.use(express.json());
app.use(cors());

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
  const text = msg.text;
  console.log("text: ", text);

  if (text === "/start") {
    await bot.sendMessage(chatId, "Оформити замовлення", {
      reply_markup: {
        keyboard: [[{ text: "Оформити замовлення", web_app: { url: webApp } }]],
      },
    });
  }

  // send a message to the chat acknowledging receipt of their message
//   bot.sendMessage(chatId, "Шо ты хочешь? Корсетов нет! Закончились");
});

app.get("/web-data", (req, res) => {
    return res.status(200).json({ test: 'test'})
})

app.post("/web-data", async (req, res) => {
  console.log('req: ', req);
  const { queryId, order, totalPrice } = req.body;
  console.log('totalPrice: ', totalPrice);
  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Замовлення сформоване",
      input_message_content: { message_text: `Загальна сума до сплати ${totalPrice} грн.` },
    });

    return res.status(200).json({})
  } catch (error) {
    console.log("error: ", error);
    await bot.answerWebAppQuery(queryId, {
        type: "article",
        id: queryId,
        title: "Не вдалось сформувати замовлення",
        input_message_content: { message_text: "Не вдалось сформувати замовлення" },
    });
    return res.status(500).json({})
  }
});

const PORT = 8000;

app.listen(PORT, () => console.log("server started on port" + PORT));
