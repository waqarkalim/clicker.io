import React, { useState, useEffect } from "react";

import {
  Checkbox,
  FormGroup,
  FormControlLabel,
  TextField,
  Button,
  Typography,
  IconButton,
} from "@material-ui/core";

import { makeStyles, withStyles } from "@material-ui/core/styles";

import { uuidv4, generateUniqueNumber } from "../helpers/helper";

import GameScreen from "./GameScreen.jsx";

import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";

import socketIOClient from "socket.io-client";

const ENDPOINT = "";

const useStyles = (theme) => ({
  username: {
    fontFamily: "Helvetica",
    fontSize: "32px",
    background: "#ffffff",
    padding: "10px 20px 10px 20px",
    margin: "20px",
    marginTop: "20px",
    borderRadius: "12px",
    zIndex: "100",
  },
  goBackButton: {
    // margin: theme.spacing(1),
    border: '1px solid #3f51b5',
    position: 'absolute',
    bottom: '10%',
    margin: 'auto',
    left: '10%'
  },
});

class StartingScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      socketIO: null,
      count: 0,
      users: [],
      isTheGameStartedInTheRoom: false,
      username: "",
      room: null,
      roomIdGenerated: false,
      createRoomChecked: false,
      joinRoomChecked: false,
      startGame: false,
    };
  }
  componentDidMount() {
    this.setState(
      {
        id: generateUniqueNumber(),
        socketIO: socketIOClient(ENDPOINT, { transport: ["websocket"] }),
        username: localStorage.getItem("username")
          ? localStorage.getItem("username")
          : this.state.username,
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
  }

  joinRoom = () => {
    const { id, room, socketIO, username } = this.state;
    const data = {
      id: id,
      room: room,
      username: username,
    };
    socketIO.emit("new user", data);
    localStorage.setItem("username", username);
    this.setState({ startGame: true });
  };

  render() {
    const { classes } = this.props;
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
        {/* <IconButton
          onClick={() => {
            this.props.history.goBack();
          }}
          color={"primary"}
          size={"medium"}
          className={classes.goBackButton}
        >
          <KeyboardArrowLeftIcon fontSize={"large"}/>
        </IconButton> */}
        {!startGame && (
          <>
            <TextField
              value={username}
              error={username === ""}
              onChange={(event) => {
                this.setState({ username: event.target.value });
              }}
              placeholder={"Username"}
              className={classes.username}
            />
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={createRoomChecked}
                    onChange={() => {
                      if (!createRoomChecked && joinRoomChecked) {
                        this.setState({ joinRoomChecked: !joinRoomChecked });
                      }
                      this.setState({ createRoomChecked: !createRoomChecked });
                    }}
                  />
                }
                label={"Create Room"}
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
                      }
                      this.setState({ joinRoomChecked: !joinRoomChecked });
                    }}
                  />
                }
                label={"Join Room"}
              />
            </FormGroup>
            {createRoomChecked ? (
              <>
                <Button
                  onClick={() => {
                    this.setState(
                      { room: uuidv4(), roomIdGenerated: true },
                      () => {
                        this.joinRoom();
                      }
                    );
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
                  error={this.state.room === null || this.state.room === ""}
                  helperText={"Enter Room Id Here"}
                  onChange={(event) => {
                    this.setState({ room: event.target.value });
                  }}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      this.joinRoom();
                      this.setState({ startGame: true });

                      event.preventDefault();
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    this.joinRoom();
                    this.setState({ startGame: true });
                  }}
                  disabled={this.state.room === null || this.state.room === ""}
                  variant={"contained"}
                  color={"primary"}
                >
                  Join Room
                </Button>
              </>
            ) : null}
          </>
        )}
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

export default withStyles(useStyles)(StartingScreen);

// function StartingScreen(props) {
//   const classes = useStyles();

//   const [id, setId] = useState(generateUniqueNumber());
//   const [socketIO, setSocketIO] = useState(
//     socketIOClient(ENDPOINT, { transport: ["websocket"] })
//   );

//   const [count, setCount] = useState(0);
//   const [users, setUsers] = useState([]);

//   const [isTheGameStartedInTheRoom, setIsTheGameStartedInTheGame] = useState(
//     false
//   );

//   const [username, setUsername] = useState("");
//   const [room, setRoom] = useState("");
//   const [roomIdGenerated, setRoomIdGenerated] = useState(false);

//   const [createRoomChecked, setCreateRoomChecked] = useState(false);
//   const [joinRoomChecked, setJoinRoomChecked] = useState(false);

//   const [startGame, setStartGame] = useState(false);

//   //   const { id, count, socketIO, users, isTheGameStartedInTheRoom } = props;

//   useEffect(() => {
//     socketIO.on("count", (data) => {
//       setCount(data);
//     });
//     socketIO.on("users", (data) => {
//       setUsers(data);
//     });
//     socketIO.on("change game status", (data) => {
//       setIsTheGameStartedInTheGame(data);
//     });

//     return () => socketIO.disconnect();
//   }, [room]);

//   const joinRoom = () => {
//     // const { id, socketIO } = props;
//     const data = {
//       id: id,
//       room: room,
//       username: username,
//     };
//     socketIO.emit("new user", data);
//     setStartGame(true);
//   };

//   return (
//     <>
//       {!startGame && (
//         <>
//           <TextField
//             value={username}
//             autoFocus={true}
//             error={username === ""}
//             onChange={(event) => {
//               setUsername(event.target.value);
//             }}
//             placeholder={"Username"}
//             className={classes.username}
//           />
//           <FormGroup row>
//             <FormControlLabel
//               control={
//                 <Checkbox
//                   checked={createRoomChecked}
//                   onChange={() => {
//                     if (!createRoomChecked && joinRoomChecked) {
//                       setJoinRoomChecked(!joinRoomChecked);
//                     }
//                     setCreateRoomChecked(!createRoomChecked);
//                   }}
//                 />
//               }
//               label={"Create Room"}
//             />
//             <FormControlLabel
//               control={
//                 <Checkbox
//                   checked={joinRoomChecked}
//                   onChange={() => {
//                     if (createRoomChecked && !joinRoomChecked) {
//                       setCreateRoomChecked(!createRoomChecked);
//                     }
//                     setJoinRoomChecked(!joinRoomChecked);
//                   }}
//                 />
//               }
//               label={"Join Room"}
//             />
//           </FormGroup>
//           {createRoomChecked ? (
//             <>
//               <Button
//                 onClick={() => {
//                   setRoom(uuidv4());
//                   setRoomIdGenerated(true);
//                   joinRoom();
//                 }}
//                 variant="contained"
//                 color="primary"
//               >
//                 Generate Room Id
//               </Button>
//             </>
//           ) : null}
//           {joinRoomChecked ? (
//             <>
//               <TextField
//                 value={room}
//                 autoFocus={true}
//                 helperText={"Enter Room Id Here"}
//                 onChange={(event) => {
//                   setRoom(event.target.value);
//                 }}
//                 onKeyPress={(event) => {
//                   if (event.key === "Enter") {
//                     joinRoom();
//                     setStartGame(true);
//                     event.preventDefault();
//                   }
//                 }}
//               />
//               <Button
//                 onClick={() => {
//                   joinRoom();
//                   setStartGame(true);
//                 }}
//                 variant={"contained"}
//                 color={"primary"}
//               >
//                 Join Room
//               </Button>
//             </>
//           ) : null}
//         </>
//       )}
//       {startGame ? (
//         <GameScreen
//           id={id}
//           count={count}
//           room={room}
//           socketIO={socketIO}
//           username={username}
//           users={users}
//           startGame={startGame}
//           isTheGameStartedInTheRoom={isTheGameStartedInTheRoom}
//         />
//       ) : null}
//     </>
//   );
// }

// export default StartingScreen;
