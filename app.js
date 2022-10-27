const axios = require('axios');
const cors = require("cors");
var bot = require('./tgbot/bot');
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

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

// TimeOut crutch
const hour = 60 * 1000 * 60;
setInterval(() => {
  axios.get('https://5mood-tg-bot.azurewebsites.net/web-data')
}, hour)

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

module.exports = app;
