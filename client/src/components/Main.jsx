import React, { Component } from "react";
import {
  Checkbox,
  FormGroup,
  FormControlLabel,
  TextField,
  Button,
  Typography,
  Grid,
} from "@material-ui/core";

import { CountdownCircleTimer } from "react-countdown-circle-timer";

import GameScreen from "./GameScreen";

// import ClientComponent from "./ClientComponent";

import socketIOClient from "socket.io-client";
// import openSocket from "socket.io-client";
// const ENDPOINT = "http://192.168.4.26:3001";
// const ENDPOINT = "http://localhost:5000";

const ENDPOINT = "";

function uuidv4() {
  return "xxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateUniqueNumber() {
  return "xxxxxxxxxxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      room: "",
      count: 0,
      loadClient: true,
      startingScreen: true,
      createRoomChecked: false,
      joinRoomChecked: false,
      roomIdGenerated: false,
      startGame: false,
      response: "",
      socketIO: null,
      id: null,
      username: "",
      users: [],
      isTheGameStartedInTheRoom: false,
    };
  }

  clickButton = (el) => {
    el.click();
  };

  componentDidMount() {
    this.setState(
      {
        id: generateUniqueNumber(),
        socketIO: socketIOClient(ENDPOINT, { transport: ["websocket"] }),
      },
      () => {
        this.state.socketIO.on("count", (data) => {
          this.setState({ count: data });
        });
        this.state.socketIO.on("users", (data) => {
          this.setState({ users: data });
        });
        this.state.socketIO.on("change game status", (data) => {
          this.setState({ isTheGameStartedInTheRoom: data });
        });
      }
    );
    // this.setState({ id: generateUniqueNumber() }, () => {
    //   this.setState(
    //     { socketIO: socketIOClient(ENDPOINT, { transport: ["websocket"] }) },
    //     () => {
    //       this.state.socketIO.on("count", (data) => {
    //         this.setState({ count: data });
    //       });
    //       this.state.socketIO.on("users", (data) => {
    //         this.setState({ users: data });
    //       });
    //     }
    //   );
    // });

    return () => this.socketIO.disconnect();
    // this.socketIO.emit("disconnect", {
    //   id: this.state.id,
    //   room: this.state.room,
    // });
  }

  joinRoom = () => {
    const { id, room, socketIO, username } = this.state;
    const data = {
      id: id,
      room: room,
      username: username,
    };
    socketIO.emit("new user", data);
    this.setState({ startGame: true });
  };

  render() {
    const {
      id,
      room,
      count,
      loadClient,
      startingScreen,
      createRoomChecked,
      joinRoomChecked,
      roomIdGenerated,
      startGame,
      response,
      socketIO,
      username,
      users,
      isTheGameStartedInTheRoom,
    } = this.state;
    return (
      <>
        {!startGame ? (
          <>
            {startingScreen && (
              <>
                <Typography variant="h1" style={{ padding: "0.5em" }}>
                  Clicker.io
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => {
                    this.setState({ startingScreen: false });
                  }}
                >
                  Start
                </Button>
              </>
            )}
            {!startingScreen && (
              <>
                <TextField
                  value={username}
                  autoFocus={true}
                  // required
                  error={username === ""}
                  onChange={(event) => {
                    this.setState({ username: event.target.value });
                  }}
                  placeholder={"Username"}
                  style={{
                    fontFamily: "Helvetica",
                    fontSize: "32px",
                    background: "#ffffff",
                    padding: "10px 20px 10px 20px",
                    // padding: '20px',
                    margin: "20px",
                    marginTop: "20px",
                    borderRadius: "12px",
                    zIndex: "100",
                  }}
                />
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={createRoomChecked}
                        onChange={() => {
                          if (!createRoomChecked && joinRoomChecked) {
                            this.setState({
                              joinRoomChecked: !joinRoomChecked,
                            });
                          }
                          this.setState({
                            createRoomChecked: !createRoomChecked,
                          });
                        }}
                      />
                    }
                    label="Create Room"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={joinRoomChecked}
                        onChange={() => {
                          if (createRoomChecked && !joinRoomChecked) {
                            this.setState({
                              createRoomChecked: !createRoomChecked,
                            });
                            // setCreateRoomChecked(!createRoomChecked);
                          }
                          this.setState({ joinRoomChecked: !joinRoomChecked });
                          // setJoinRoomChecked(!joinRoomChecked);
                        }}
                      />
                    }
                    label="Join Room"
                  />
                </FormGroup>
                {createRoomChecked ? (
                  <>
                    <Button
                      onClick={() => {
                        this.setState({ room: uuidv4() }, () => {
                          this.setState({ roomIdGenerated: true }, () => {
                            this.joinRoom();
                            // this.setState({startGame: true});
                          });
                        });
                      }}
                      variant="contained"
                      color="primary"
                    >
                      Generate Room Id
                    </Button>
                  </>
                ) : null}
                {joinRoomChecked ? (
                  <>
                    <TextField
                      value={room}
                      autoFocus={true}
                      helperText={"Enter Room Id Here..."}
                      onChange={(event) => {
                        this.setState({ room: event.target.value });
                        // setRoom(event.target.value);
                      }}
                      onKeyPress={(ev) => {
                        if (ev.key === "Enter") {
                          // Do code here
                          this.joinRoom();
                          this.setState({ startGame: true });
                          ev.preventDefault();
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        this.joinRoom();
                        this.setState({ startGame: true });
                        // setStartGame(true);
                      }}
                      variant="contained"
                      color="primary"
                    >
                      Join Room
                    </Button>
                  </>
                ) : null}

                {roomIdGenerated ? (
                  <>
                    <Typography>{room}</Typography>
                  </>
                ) : null}
              </>
            )}
          </>
        ) : null}
        {startGame ? (
          <GameScreen
            id={id}
            count={count}
            room={room}
            socketIO={socketIO}
            username={username}
            users={users}
            startGame={startGame}
            isTheGameStartedInTheRoom={isTheGameStartedInTheRoom}
          />
        ) : null}
      </>
    );
  }
}

export default Main;
