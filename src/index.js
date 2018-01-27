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
import Day009 from "./009_RentThisCanvas";
import Day010 from './010_BackgroundColorDemocracy';
import Day011 from "./011_Blockcaster";
import Day012 from "./012_Autocracy";
import Day013 from "./013_BurnEther";
import Day014 from "./014_ClassConsciousness";
import Day015 from "./015_WalletsOnline";
import Day016 from "./016_PersonalAdvisor";
import Day017 from "./017_Tribute";
import Day018 from "./018_CryptoRiddles";
import Day019 from "./019_EtherMail";
import Day020 from "./020_CypherpunkReports";
import Day021 from "./021_BlockchainWill";
import Day022 from "./022_PublicTodos";
import Day023 from "./023_OfficeHours";
import Day024 from "./024_OverflowOfSisyphus";

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
      <Route path="/009_RentThisCanvas" component={Day009} />
      <Route path="/010_BackgroundColorDemocracy" component={Day010} />
      <Route path="/011_Blockcaster" component={Day011} />
      <Route path="/012_Autocracy" component={Day012} />
      <Route path="/013_BurnEther" component={Day013} />
      <Route path="/014_ClassConsciousness" component={Day014} />
      <Route path="/015_WalletsOnline" component={Day015} />
      <Route path="/016_PersonalAdvisor" component={Day016} />
      <Route path="/017_Tribute" component={Day017} />
      <Route path="/018_CryptoRiddles" component={Day018} />
      <Route path="/019_EtherMail" component={Day019} />
      <Route path="/020_CypherpunkReports" component={Day020} />
      <Route path="/021_BlockchainWill" component={Day021} />
      <Route path="/022_PublicTodos" component={Day022} />
      <Route path="/023_OfficeHours" component={Day023} />
      <Route path="/024_OverflowOfSisyphus" component={Day024} />
    </Switch>
  </HashRouter>,
  document.getElementById("root")
);

registerServiceWorker();
