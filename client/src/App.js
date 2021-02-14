import logo from "./logo.svg";
import "./App.css";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams,
} from "react-router-dom";

import Main from "./components/Main";
import StartingScreen from "./components/StartingScreen";
import HowToPlayScreen from "./components/HowToPlayScreen";

// const BrowserHistory = require("react-router/lib/BrowserHistory").default;

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Router>
          <Switch>
            <Route exact path="/" component={Main} />
            <Route path="/start" component={StartingScreen} />
            <Route path="/how-to-play" component={HowToPlayScreen} />
          </Switch>
        </Router>
      </header>
    </div>
  );
}

export default App;
