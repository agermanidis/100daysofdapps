import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { Route, IndexRoute } from "react-router";
import { HashRouter, Switch } from "react-router-dom";

import { EthereumWrapper } from "./common";

import Day001 from "./001_Friendship";
import Day002 from './002_Forgiveness';
import Day003 from "./003_SecretKeeper";
import Day004 from "./004_ChristmasClub";
import Day005 from "./005_WordMarket";
import Day006 from "./006_BlockchainWitness";
import Day007 from "./007_PublicProfile";
import Day008 from "./008_DecentralizedWiki";

ReactDOM.render(
  <HashRouter>
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/001_Friendship" component={Day001} />
      <Route path="/002_Forgiveness" component={Day002} />
      <Route path="/003_SecretKeeper" component={Day003} />
      <Route path="/004_ChristmasClub" component={Day004} />
      <Route path="/005_WordMarket" component={Day005} />
      <Route path="/006_BlockchainWitness" component={Day006} />
      <Route path="/007_PublicProfile" component={Day007} />
      <Route path="/008_DecentralizedWiki" component={Day008} />
    </Switch>
  </HashRouter>,
  document.getElementById("root")
);

registerServiceWorker();
