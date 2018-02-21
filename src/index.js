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
import Day025 from "./025_CryptoAggregator";
import Day026 from "./026_RecentlyPossibleCoin";
import Day027 from "./027_AlarmClockWithConsequences";
import Day028 from "./028_AltruismContract";
import Day029 from "./029_BlockchainNeighbor";
import Day030 from "./030_PermanentMemories";
import Day031 from "./031_GoalTracker";
import Day032 from "./032_IPFSBin";
import Day033 from "./033_Decentrachat";
import Day034 from "./034_BlockVisualizer";
import Day035 from "./035_ProofOfWork";
import Day036 from "./036_EmotionCoins";
import Day037 from "./037_CryptoAdulthood";
import Day038 from "./038_InspectDAO";
import Day039 from "./039_PhoenixContract";
import Day040 from "./040_MakeGoodArt";
import Day041 from "./041_EtherSign";
import Day042 from "./042_P2PJam";
import Day043 from "./043_OffChainTicTacToe";
import Day044 from "./044_CoolHashes";
import Day045 from "./045_DStorage";
import Day046 from "./046_Coinvote";
import Day047 from "./047_DecentralizedChatbot";
import Day048 from "./048_ToyBlockchain";
import Day049 from "./049_PaymentRequest";

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
      <Route path="/025_CryptoAggregator" component={Day025} />
      <Route path="/026_RecentlyPossibleCoin" component={Day026} />
      <Route path="/027_AlarmClockWithConsequences" component={Day027} />
      <Route path="/028_AltruismContract" component={Day028} />
      <Route path="/029_BlockchainNeighbor" component={Day029} />
      <Route path="/030_PermanentMemories" component={Day030} />
      <Route path="/031_GoalTracker" component={Day031} />
      <Route path="/032_IPFSBin" component={Day032} />
      <Route path="/033_Decentrachat" component={Day033} />
      <Route path="/034_BlockVisualizer" component={Day034} />
      <Route path="/035_ProofOfWork" component={Day035} />
      <Route path="/036_EmotionCoins" component={Day036} />
      <Route path="/037_CryptoAdulthood" component={Day037} />
      <Route path="/038_InspectDAO" component={Day038} />
      <Route path="/039_PhoenixContract" component={Day039} />
      <Route path="/040_MakeGoodArt" component={Day040} />
      <Route path="/041_EtherSign" component={Day041} />
      <Route path="/042_P2PJam" component={Day042} />
      <Route path="/043_OffChainTicTacToe" component={Day043} />
      <Route path="/044_CoolHashes" component={Day044} />
      <Route path="/045_DStorage" component={Day045} />
      <Route path="/046_Coinvote" component={Day046} />
      <Route path="/047_DecentralizedChatbot" component={Day047} />
      <Route path="/048_ToyBlockchain" component={Day048} />
      <Route path="/049_PaymentRequest" component={Day049} />
    </Switch>
  </HashRouter>,
  document.getElementById("root")
);

registerServiceWorker();
