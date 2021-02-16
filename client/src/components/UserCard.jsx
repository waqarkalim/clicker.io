import React, { useState, useEffect } from "react";
import { Paper, Typography } from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

const useStyles = makeStyles((theme) => ({
  root: {
    // display: "flex",
    // marginTop: theme.spacing.unit * 3,
    // overflowX: "hide",
    // backgroundColor: "#282c34",
    padding: theme.spacing.unit * 2,
  },
  paper: {
    display: "flex",
    borderRadius: theme.spacing.unit * 2,
    flexDirection: "column",
    width: "4em",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: "center",
    overflow: "hidden",
    spacing: theme.spacing.unit * 2,
  },
  timerContainer: {
    padding: theme.spacing.unit * 2,
  },
  timer: {
    // padding: theme.spacing.unit * 2,
    // textAlign: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: "100%",
  },
  name: {
    backgroundColor: "#3f51b5",
    color: "#FFFFFF",
    width: "100%",
    wordBreak: "break-all",
  },
  score: {},
}));

function User(props) {
  const classes = useStyles();
  const {
    name,
    score,
    timeRemaining,
    socketIO,
    isTheGameStartedInTheRoom,
    setIsGameCompleted,
  } = props;
  const [remainingTime, setRemainingTime] = useState(0);
  const [duration, setDuration] = useState(20);

  useEffect(() => {
    socketIO.emit("user update time", remainingTime);
  }, [remainingTime, socketIO]);

  useEffect(() => {
    socketIO.emit("user update time", duration);
  }, [score, duration, socketIO]);

  return (
    <>
      <div className={classes.root}>
        <Paper elevation={5} className={classes.paper}>
          <Typography variant="h5" className={classes.name}>
            {`${name}`}
          </Typography>
          <div className={classes.timerContainer}>
            <Paper elevation={5} square className={classes.timer}>
              <Typography variant="body">{`${score}`}</Typography>
            </Paper>
          </div>
          <div className={classes.timerContainer}>
            <Paper elevation={5} square className={classes.timer}>
              <CountdownCircleTimer
                key={score}
                isPlaying={isTheGameStartedInTheRoom}
                duration={duration}
                onComplete={() => {
                  setIsGameCompleted(true);
                }}
                initialRemainingTime={
                  isTheGameStartedInTheRoom ? timeRemaining - 1 : timeRemaining
                }
                strokeWidth={3}
                size={50}
                colors={[
                  ["#004777", 0.33],
                  ["#F7B801", 0.33],
                  ["#A30000", 0.33],
                ]}
              >
                {({ remainingTime }) => {
                  setRemainingTime(remainingTime);
                  return remainingTime;
                }}
              </CountdownCircleTimer>
            </Paper>
          </div>
        </Paper>
      </div>
    </>
  );
}

export default User;
