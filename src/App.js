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
          100 Days of <ExternalLink href="http://tyleryasaka.me/blog/2017/01/14/ethereum-dapps.html">
            Ðapps
          </ExternalLink>
        </h1>
        <h3>
          <p>1. <Link to="/001_Friendship">Friendship Contract</Link></p>
          <p>2. <Link to="/002_Forgiveness">Blockchain Confessional</Link></p>
        </h3>
      </div>;
  }
}

export default App;
