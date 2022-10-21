require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const cors = require("cors");
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

const token = process.env.TG_TOKEN;
const webApp = "https://regal-bonbon-664a6e.netlify.app";
const bot = new TelegramBot(token, { polling: true });

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.get("/web-data", (req, res) => {
  return res.status(200).json({ test: "test" });
});

app.post("/web-data", async (req, res) => {
  const { queryId, order, totalPrice } = req.body;

  const order_message = order.reduce((acc, item) => {
    return (acc += `\n- ${item.title}: ${item.count} шт. ${item.price} грн.`);
  }, "\n");

  try {
    await bot.sendMessage("-744637151", `Нове замовлення: ${order_message}`);

    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Замовлення сформоване",
      input_message_content: {
        message_text: `Загальна сума до сплати ${totalPrice} грн. ${order_message}`,
      },
    });

    return res.status(200).json({});
  } catch (error) {
    console.log("error: ", error);
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Не вдалось сформувати замовлення",
      input_message_content: {
        message_text: "Не вдалось сформувати замовлення",
      },
    });
    return res.status(500).json({
      error: error,
      queryId,
    });
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

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

module.exports = app;
