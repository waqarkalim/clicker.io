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
}));

function GameScreen(props) {
  const classes = useStyles();

  let audio = new Audio("/error-sound-effect.mp3");

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
    playAudio,
    changeAudio
  } = props;

  useEffect(() => {
    if (playAudio) {
      audio
        .play()
        .then((data) => {
          console.log("Playing Audio...");
        })
        .catch((err) => {
          console.error(err);
        });
      changeAudio(false);
    }
  }, [playAudio]);

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
                color="secondary"
                // color={"#757ce8"}
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
