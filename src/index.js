import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { Route, IndexRoute } from "react-router";
import { HashRouter, Switch } from "react-router-dom";

import { EthereumWrapper } from "./common";

import Day001 from "./001_Friendship";

ReactDOM.render(
  <HashRouter>
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/001_Friendship" component={Day001} />
    </Switch>
  </HashRouter>,
  document.getElementById("root")
);

registerServiceWorker();
