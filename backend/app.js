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

const User = require("./classes/User");
const House = require("./classes/House");
const Room = require("./classes/Room");

// dotenv.config();

const responseArray = [];

const port = process.env.PORT || 5000;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
// app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../client/build")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname + "../client/build/index.html"));
// });

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

const house = new House();

let interval;

io.on("connection", (socket) => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = (() => getApiAndEmit(socket), 1000);

  // When client disconnects
  socket.on("disconnect", () => {
    console.log("Client disconnected");

    const client_id = socket.id;
    const room_id = socket2RoomMap[client_id];

    if (house.doesRoomExist(room_id)) {
      console.log(
        `User ${house
          .getRoom(room_id)
          .getUser(client_id)
          .getName()} has left room ${room_id}`
      );

      house.getRoom(room_id).deleteUser(client_id);
      io.sockets.in(room_id).emit("users", house.getRoom(room_id).getUsers());

      // If the room has no users, destroy the room
      if (house.getRoom(room_id).getUsers().length === 0) {
        house.destroyRoom(room_id);
        console.log(`Room ${room_id} destroyed`);
      }
    }
  });

  socket.on("change game status", (data) => {
    const client_id = socket.id;
    const room_id = socket2RoomMap[client_id];

    if (data) {
      house.getRoom(room_id).startGame();
    } else {
      house.getRoom(room_id).stopGame();
    }
    io.sockets.in(room_id).emit("change game status", data);
  });

  // When a new user joins a room
  socket.on("new user", (data) => {
    const room_id = data.room;
    console.log(`id: ${data.id}`);

    // If this user is the first user to join the room, then create the room
    if (!house.doesRoomExist(room_id)) {
      house.createRoom(room_id);
    }

    socket.join(room_id);
    socket2RoomMap[socket.id] = room_id;

    const room = house.getRoom(room_id);

    room.setUser(socket.id, new User(data.id, data.username, socket.id));

    io.sockets.in(room_id).emit("count", room.getCount());
    io.sockets.in(room_id).emit("users", room.getUsers());
    io.sockets.in(room_id).emit("change game status", room.getGameStatus());

    console.log(`New User added: ${room.getUser(socket.id)}`);
  });

  socket.on("user update time", (data) => {
    const room_id = socket2RoomMap[socket.id];
    const room = house.getRoom(room_id);

    const user = room.getUser(socket.id);

    // user.setScore(data.score);
    user.setTimeRemaining(data);
    // console.log(`Time Remaining updated for user ${socket.id}`);
    io.sockets.in(room_id).emit("users", room.getUsers());
  });

  // When the client presses the button
  socket.on("buttonPress", (data) => {
    if (!data.room) {
      console.log(
        "For some weird reason, you're clicking without being in a room."
      );
      return;
    }

    const client_id = socket.id;
    const room_id = data.room;

    const room = house.getRoom(room_id);

    if (room instanceof Error) {
      console.error(room.message);
      return;
    }

    const mostRecentButtomPress = room.getLatest();

    console.log(room.getUsers());

    room.setLatest(data);

    // Logic for clicks
    if (
      mostRecentButtomPress !== undefined &&
      data.room === mostRecentButtomPress.room &&
      mostRecentButtomPress.id === data.id
    ) {
      // Void click
      console.log("Void click...");
      return;
    } else if (
      mostRecentButtomPress !== undefined &&
      data.room === mostRecentButtomPress.room &&
      data.timestamp - mostRecentButtomPress.timestamp <
        timeElapsedBetweenButtonPresses
    ) {
      // Bad click
      room.reset();

      console.log("Failed click! Resetting...");
    } else {
      // Good click
      room.incrementCount();
      room.getUser(client_id).incrementScore();
      room.getUser(client_id).setTimeRemaining(room.getInitialRoomTime());

      console.log("Successful click! Incrementing count...");
    }

    io.sockets.in(room_id).emit("count", room.getCount());
    io.sockets.in(room_id).emit("users", house.getRoom(room_id).getUsers());
  });

  // setTimeout(() => { },1000);
});

const getApiAndEmit = (socket) => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  socket.emit("FromAPI", response);
};

server.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;
