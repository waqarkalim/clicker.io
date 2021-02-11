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

const roomMap = {};
const socket2RoomMap = {};

/*

{
  'room': {
    'count': int,
    'latest': obj,
    'users': {

    }
    // 'users': [
    //   {
    //     'id': string,
    //     'username': string
    //   }, 
    //   ... 
    // ]
  }
}

*/

let interval;

io.on("connection", (socket) => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = (() => getApiAndEmit(socket), 1000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
    // const room = socket2RoomMap[socket.id];

    // roomMap[room].users = roomMap[room].users.filter(item => item.socket_id != socket.id)
    // io.sockets.in(room).emit("users", roomMap[room].users.map(item => item.username));
  });

  socket.on("room", async (data) => {
    const room = data.room;

    // socket2RoomMap[socket.id] = room;

    const user = {
      socket_id: socket.id,
      id: data.id,
      username: data.username,
    }

    const username = user.username;

    if (roomMap[room]) {
      roomMap[room].users.push(user);
    } else {
      roomMap[data.room] = {
        count: 0,
        latest: "",
        users: [],
      };
      roomMap[room].users.push(user);
    }

    socket.join(room);

    io.sockets.in(room).emit("count", roomMap[room].count);
    io.sockets.in(room).emit("users", roomMap[room].users.map(item => item.username));

    console.log(`User ${username} joined Room ${room}`);
  });

  socket.on("buttonPress", (data) => {
    if (data.room) {
      if (!(data.room in roomMap)) {
        roomMap[data.room].latest = "";
      }

      const mostRecentButtomPress = roomMap[data.room].latest;

      roomMap[data.room].latest = data;
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
        roomMap[data.room].count = 0;
        roomMap[data.room].latest = "";

        io.sockets.in(data.room).emit("count", roomMap[data.room].count);
        console.log("You done messed up!");
      } else {
        // If the users didn't mess up
        roomMap[data.room].count = roomMap[data.room].count + 1;
        io.sockets.in(data.room).emit("count", roomMap[data.room].count);
      }
      console.log(roomMap);
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
