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

// import ClientComponent from "./ClientComponent";

import socketIOClient from "socket.io-client";
// import openSocket from "socket.io-client";
const ENDPOINT = "http://192.168.4.26:3001";

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
      userList: [],
    };
  }

  clickButton = (el) => {
    el.click();
  };

  countingButtonPress = (event) => {
    const { startGame } = this.state;
    if (startGame) {
      if (event?.keyCode === 32) {
        this.handleButtonPress();
      }
    }
  };

  componentDidMount() {
    document.addEventListener("keydown", this.countingButtonPress, false);

    this.setState({ id: generateUniqueNumber() }, () => {
      this.setState(
        { socketIO: socketIOClient(ENDPOINT, { transport: ["websocket"] }) },
        () => {
          this.state.socketIO.on("count", (data) => {
            this.setState({ count: data });
          });
          this.state.socketIO.on("userList", (data) => {
            this.setState({ userList: data });
          });
        }
      );
    });

    return () => this.socketIO.disconnect();
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.countingButtonPress, false);
  }

  joinRoom = () => {
    const { room, socketIO, username } = this.state;
    const data = {
      room: room,
      username: username,
    };
    socketIO.emit("room", data);
    this.setState({ startGame: true });
  };

  handleButtonPress = () => {
    const { id, count, room, socketIO, username } = this.state;
    // this.setState({ count: count+1});

    const data = {
      id: id,
      room: room,
      message: "Hello World",
      timestamp: Date.now(),
      username: username,
    };
    console.log(data);
    socketIO.emit("buttonPress", data);
  };

  render() {
    const {
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
      userList,
    } = this.state;
    return (
      <>
        {/* <Typography variant="h1">Addiction With Extra Steps</Typography> */}
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
                    {/* <TextField
          value={room}
          disabled={true}
        /> */}
                  </>
                ) : null}
              </>
            )}
          </>
        ) : null}
        {startGame ? (
          <>
            {/* {userList.map((user) => {
              return (
                <Typography variant="body">{`${user}`}</Typography>
              )
            })} */}
            <Grid
              container
              spacing={0}
              align="center"
              justify="center"
              direction="column"
            >
              <Grid container item xs={12} spacing={0}>
                <React.Fragment>
                  {userList.map((user) => {
                    return (
                      <Grid
                        item
                        xs
                        align={"center"}
                        alignItems={"center"}
                        justify={"center"}
                      >
                        <CountdownCircleTimer
                          isPlaying
                          duration={10}
                          strokeWidth={5}
                          size={60}
                          colors={[
                            ["#004777", 0.33],
                            ["#F7B801", 0.33],
                            ["#A30000", 0.33],
                          ]}
                        >
                          {({ remainingTime }) => remainingTime}
                        </CountdownCircleTimer>
                        <Typography variant="body">{`${user}`}</Typography>
                      </Grid>
                    );
                  })}
                </React.Fragment>
              </Grid>
              <Grid item xs={12}>
                <Typography>{`Room Id: ${room}`}</Typography>
                <Typography variant="h1">{count}</Typography>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  ref={this.countingButtonPress}
                  onClick={() => {
                    this.handleButtonPress();
                    // this.setState({count: count+1});
                    // setCount(count + 1);
                  }}
                >
                  Press Me
                </Button>
              </Grid>
              <Grid item xs={12}></Grid>
            </Grid>
          </>
        ) : null}
      </>
    );
  }
}

export default Main;
