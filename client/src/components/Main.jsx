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

import { Link } from "react-router-dom";


const Main = () => (
  <div>
    <Typography variant="h1" style={{ padding: "0.5em" }}>
      Clicker.io
    </Typography>
    <Link to="/start">
      <Button variant={"contained"} color={"primary"} size={"large"}>
        Start
      </Button>
    </Link>
    <Link to="/how-to-play">
      <Button variant={"contained"} color={"primary"} size={"large"}>
        How To Play
      </Button>
    </Link>
  </div>
);

export default Main;
