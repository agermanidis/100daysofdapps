import React, { Component } from 'react';
import { Link } from "react-router-dom";
import './App.css';
import EthLogo from './ethlogo.svg';
import {ExternalLink} from './common';

class App extends Component {
  render() {
    return <div className="App">
        <img alt="Ethereum Logo" width={100} src={EthLogo} />
        <h1>
          100 Days of Ðapps
        </h1>
        <p>Note: Due to <ExternalLink href='https://ethgasstation.info/'>outrageous gas prices</ExternalLink>, all contracts will be deployed on the Ropsten test network, starting from day 3.</p>
        <h3>
          <p>
            1. <Link to="/001_Friendship">Friendship Contract</Link>
          </p>
          <p>
            2. <Link to="/002_Forgiveness">Blockchain Confessional</Link>
          </p>
          <p>
            3. <Link to="/003_SecretKeeper">Secret Keeper</Link>
          </p>
        </h3>
      </div>;
  }
}

export default App;
