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
  console.log("totalPrice: ", totalPrice);
  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Замовлення сформоване",
      input_message_content: {
        message_text: `Загальна сума до сплати ${totalPrice} грн.`,
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
    return res.status(500).json({});
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

module.exports = app;
