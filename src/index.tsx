import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { Auth } from "@opendata-mvcr/assembly-line-shared";
import App from "./main/App";
import { Environment } from "./config/Environment";

const Main = () =>
  Environment.auth ? (
    <Auth>
      <App />
    </Auth>
  ) : (
    <App />
  );

ReactDOM.render(<Main />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
