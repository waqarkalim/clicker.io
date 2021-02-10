var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var fs = require("fs");
var dotenv = require("dotenv");

var pg = require("pg");

const http = require("http");
const socketIo = require("socket.io");

var cors = require("cors");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// dotenv.config();

const responseArray = [];

const port = process.env.PORT || 3001;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
// app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

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

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const timeElapsedBetweenButtonPresses = 500;
const roomCountMap = {};
const roomDataMap = {};
const roomUserList = {};

let interval;

// var count = 0;

io.on("connection", (socket) => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = (() => getApiAndEmit(socket), 1000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

io.on("connection", (socket) => {
  socket.on("room", async (data) => {
    const room = data.room;
    const username = data.username;

    // roomUserList.push(username);
    if (roomUserList[room]) {
      roomUserList[room].push(username);
    } else {
      roomUserList[room] = [];
      roomUserList[room].push(username);
    }

    socket.join(room);

    // if (roomCountMap[room]) {
    //   io.sockets.in(room).emit("count", roomCountMap[room]);
    // } else {
    //   roomCountMap[room] = 0;
    //   io.sockets.in(room).emit("count", roomCountMap[room]);
    // }

    // const data = {
    //   room: roomCountMap[room],
    //   roomUserList: roomUserList,
    // }

    if (!(room in roomCountMap)) {
      roomCountMap[room] = 0;
    }
    io.sockets.in(room).emit("count", roomCountMap[room]);
    io.sockets.in(room).emit("userList", roomUserList[room]);

    console.log(`User ${username} joined Room ${room}`);
  });
});

io.on("connection", (socket) => {
  socket.on("buttonPress", (data) => {
    if (data.room) {
      if (!(data.room in roomDataMap)) {
        roomDataMap[data.room] = [];
        console.log(roomDataMap);
      }

      const mostRecentButtomPress =
        roomDataMap[data.room][roomDataMap[data.room].length - 1];

      roomDataMap[data.room].push(data);
      socket.in(data.room).emit(data);

      if (
        (mostRecentButtomPress !== undefined &&
          data.room === mostRecentButtomPress.room &&
          data.timestamp - mostRecentButtomPress.timestamp <
            timeElapsedBetweenButtonPresses) ||
        (mostRecentButtomPress !== undefined &&
          data.room === mostRecentButtomPress.room &&
          mostRecentButtomPress.id === data.id)
      ) {
        // If the users messed up
        roomCountMap[data.room] = 0;
        roomDataMap[data.room] = [];
        io.sockets.in(data.room).emit("count", roomCountMap[data.room]);
        console.log("You done messed up!");
      } else {
        // If they didn't mess up
        roomCountMap[data.room] = roomCountMap[data.room] + 1;
        io.sockets.in(data.room).emit("count", roomCountMap[data.room]);
      }
    }
  });
});

const getApiAndEmit = (socket) => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  socket.emit("FromAPI", response);
};

server.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;
// export default app;
