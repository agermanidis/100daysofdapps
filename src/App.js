import React, { Component } from 'react';
import { Link } from "react-router-dom";
import './App.css';
import EthLogo from './ethlogo.svg';
import {ExternalLink} from './common';
import FaGithub from 'react-icons/lib/fa/github';

class App extends Component {
  render() {
    return <div className="App">
        <img alt="Ethereum Logo" width={100} src={EthLogo} />
        <h1>100 Days of ÐApps</h1>
        <h3>Note: All ÐApps are deployed on the Ropsten test network.</h3>
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
          <p>
            4. <Link to="/004_ChristmasClub">Christmas Club</Link>
          </p>
          <p>
            5. <Link to="/005_WordMarket">Word Market</Link>
          </p>
          <p>
            6. <Link to="/006_BlockchainWitness">Blockchain Witness</Link>
          </p>
          <p>
            7. <Link to="/007_PublicProfile">Public Profile</Link>
          </p>
          <p>
            8. <Link to="/008_DecentralizedWiki">Decentralized Wiki</Link>
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
