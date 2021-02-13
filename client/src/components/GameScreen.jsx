import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

import { CountdownCircleTimer } from "react-countdown-circle-timer";

import { DataGrid } from "@material-ui/data-grid";

import UserCard from "./UserCard";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  // root: {
  //   display: "flex",
  //   marginTop: theme.spacing.unit * 3,
  //   overflowX: "hide",
  //   width: "100%",
  //   // justifyContent: "center",
  //   // alignItems: "center",
  //   backgroundColor: "#282c34",
  // },
  // table: {
  //   minWidth: 340,
  // },
  // tableCell: {
  //   paddingRight: 4,
  //   paddingLeft: 5,
  //   textAlign: "center",
  //   margin: "auto",
  // },
}));

function GameScreen(props) {
  const classes = useStyles();

  const [isGameCompleted, setIsGameCompleted] = useState(false);

  const {
    id,
    count,
    room,
    socketIO,
    username,
    users,
    startGame,
    isTheGameStartedInTheRoom,
  } = props;
  const pageSize = 5;

  // useEffect(() => {
  //   document.addEventListener("keydown", countingButtonPress, false);

  //   return () => {
  //     document.removeEventListener("keydown", countingButtonPress, false);
  //   };
  // }, []);

  console.log("Users");
  console.log(users);

  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "username", headerName: "Name", width: 100 },
    { field: "score", headerName: "Score", width: 100 },
    { field: "timeRemaining", headerName: "Timer", width: 100 },
  ];
  const rows = users.map((user, index) => {
    console.log(user);

    const row = {
      id: index + 1,
      username: user.name,
      score: user.score,
      timeRemaining: user.timeRemaining,
    };
    return row;
  });

  // const countingButtonPress = (event) => {
  //   if (startGame) {
  //     if (event?.keyCode === 32) {
  //       handleButtonPress();
  //     }
  //   }
  // };

  console.log("rows");
  console.log(rows);

  const handleButtonPress = () => {
    const data = {
      id: id,
      room: room,
      message: "Hello World",
      timestamp: Date.now(),
      username: username,
    };

    console.log("data");
    console.log(data);
    socketIO.emit("buttonPress", data);
  };

  const startGameButton = () => {
    socketIO.emit("change game status", true);
  };

  return (
    <>
      <Grid
        container
        spacing={0}
        align="center"
        justify="center"
        direction="column"
      >
        <div className={classes.root}>
          <Grid container item xs={12} spacing={0}>
            <React.Fragment>
              {users.map((user) => {
                return (
                  <>
                    <Grid item xs>
                      <UserCard
                        name={user.name}
                        score={user.score}
                        timeRemaining={user.timeRemaining}
                        socketIO={socketIO}
                        isTheGameStartedInTheRoom={isTheGameStartedInTheRoom}
                        setIsGameCompleted={(data) => setIsGameCompleted(data)}
                      />
                    </Grid>
                  </>
                );
              })}
            </React.Fragment>
          </Grid>
        </div>

        <Grid item xs={12}>
          <Typography>{`Room Id: ${room}`}</Typography>
          <Typography variant="h1">{count}</Typography>

          {isTheGameStartedInTheRoom ? (
            <>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                // ref={countingButtonPress}
                onClick={() => {
                  handleButtonPress();
                }}
              >
                Press Me
              </Button>
            </>
          ) : (
            <>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                // ref={countingButtonPress}
                onClick={() => {
                  startGameButton();
                }}
              >
                Start Game
              </Button>
            </>
          )}
        </Grid>
        <Grid item xs={12}></Grid>
      </Grid>
    </>
  );
}

export default GameScreen;
