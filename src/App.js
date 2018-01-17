import React, { Component } from 'react';
import { Link } from "react-router-dom";
import './App.css';
import EthLogo from './ethlogo.svg';
import {ExternalLink} from './common';
import FaGithub from 'react-icons/lib/fa/github';

class App extends Component {
  render() {
    return <div className="App">
        <h1>100 Days of Dapps</h1>
        <h3>
          Every day, I will make a new decentralized application on the
          Ethereum blockchain.
        </h3>
        <h3>Note: All dapps are deployed on the Ropsten test network.</h3>
        <h3>
          <p>
            <small>Day 1</small>
            <Link to="/001_Friendship">Friendship Contract</Link>
          </p>
          <p>
            <small>Day 2</small>
            <Link to="/002_Forgiveness">Blockchain Confessional</Link>
          </p>
          <p>
            <small>Day 3</small>
            <Link to="/003_SecretKeeper">Secret Keeper</Link>
          </p>
          <p>
            <small>Day 4</small>
            <Link to="/004_ChristmasClub">Christmas Club</Link>
          </p>
          <p>
            <small>Day 5</small>
            <Link to="/005_WordMarket">Word Market</Link>
          </p>
          <p>
            <small>Day 6</small>
            <Link to="/006_BlockchainWitness">Blockchain Witness</Link>
          </p>
          <p>
            <small>Day 7</small>
            <Link to="/007_PublicProfile">Public Profile</Link>
          </p>
          <p>
            <small>Day 8</small>
            <Link to="/008_DecentralizedWiki">Decentralized Wiki</Link>
          </p>
          <p>
            <small>Day 9</small>
            <Link to="/009_RentThisCanvas">Rent this Canvas</Link>
          </p>
          <p>
            <small>Day 10</small>
            <Link to="/010_BackgroundColorDemocracy">
              Background Color Democracy
            </Link>
          </p>
          <p>
            <small>Day 11</small>
            <Link to="/011_Blockcaster">Blockcaster</Link>
          </p>
          <p>
            <small>Day 12</small>
            <Link to="/012_Autocracy">Autocracy</Link>
          </p>
          <p>
            <small>Day 13</small>
            <Link to="/013_BurnEther">Burn Ether</Link>
          </p>
          <p>
            <small>Day 14</small>
            <Link to="/014_ClassConsciousness">Class Consciousness</Link>
          </p>
        </h3>
        <ExternalLink href="https://github.com/agermanidis/100daysofdapps">
          <FaGithub />View source on Github
        </ExternalLink>
        <p>
          An <ExternalLink href="http://agermanidis.com">
            Anastasis Germanidis
          </ExternalLink> project.
        </p>
      </div>;
  }
}

export default App;
