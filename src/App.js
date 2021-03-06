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
          <p>
            <small>Day 15</small>
            <Link to="/015_WalletsOnline">Wallets Currently Online</Link>
          </p>
          <p>
            <small>Day 16</small>
            <Link to="/016_PersonalAdvisor">Your Personal Advisor</Link>
          </p>
          <p>
            <small>Day 17</small>
            <Link to="/017_Tribute">Tribute</Link>
          </p>
          <p>
            <small>Day 18</small>
            <Link to="/018_CryptoRiddles">CryptoRiddles</Link>
          </p>
          <p>
            <small>Day 19</small>
            <Link to="/019_EtherMail">EtherMail</Link>
          </p>
          <p>
            <small>Day 20</small>
            <Link to="/020_CypherpunkReports">Cypherpunk Reports</Link>
          </p>
          <p>
            <small>Day 21</small>
            <Link to="/021_BlockchainWill">Blockchain Will</Link>
          </p>
          <p>
            <small>Day 22</small>
            <Link to="/022_PublicTodos">Public Todos</Link>
          </p>
          <p>
            <small>Day 23</small>
            <Link to="/023_OfficeHours">Office Hours</Link>
          </p>
          <p>
            <small>Day 24</small>
            <Link to="/024_OverflowOfSisyphus">
              The Overflow of Sisyphus
            </Link>
          </p>
          <p>
            <small>Day 25</small>
            <Link to="/025_CryptoAggregator">CryptoAggregator</Link>
          </p>
          <p>
            <small>Day 26</small>
            <Link to="/026_RecentlyPossibleCoin">
              Recently Possible Coin
            </Link>
          </p>
          <p>
            <small>Day 27</small>
            <Link to="/027_AlarmClockWithConsequences">
              Alarm Clock with Consequences
            </Link>
          </p>
          <p>
            <small>Day 28</small>
            <Link to="/028_AltruismContract">Altruism Contract</Link>
          </p>
          <p>
            <small>Day 29</small>
            <Link to="/029_BlockchainNeighbor">
              Your Blockchain Neighbor
            </Link>
          </p>
          <p>
            <small>Day 30</small>
            <Link to="/030_PermanentMemories">Permanent Memories</Link>
          </p>
          <p>
            <small>Day 31</small>
            <Link to="/031_GoalTracker">Goal Tracker</Link>
          </p>
          <p>
            <small>Day 32</small>
            <Link to="/032_IPFSBin">IPFS Bin</Link>
          </p>
          <p>
            <small>Day 33</small>
            <Link to="/033_Decentrachat">Decentrachat</Link>
          </p>
          <p>
            <small>Day 34</small>
            <Link to="/034_BlockVisualizer">Block Visualizer</Link>
          </p>
          <p>
            <small>Day 35</small>
            <Link to="/035_ProofOfWork">Proof-of-Work Game</Link>
          </p>
          <p>
            <small>Day 36</small>
            <Link to="/036_EmotionCoins">Emotion Coins</Link>
          </p>
          <p>
            <small>Day 37</small>
            <Link to="/037_CryptoAdulthood">Crypto-Adulthood</Link>
          </p>
          <p>
            <small>Day 38</small>
            <Link to="/038_InspectDAO">Inspect DAO</Link>
          </p>
          <p>
            <small>Day 39</small>
            <Link to="/039_PhoenixContract">Phoenix Contract</Link>
          </p>
          <p>
            <small>Day 40</small>
            <Link to="/040_MakeGoodArt">Make Good Art Contract</Link>
          </p>
          <p>
            <small>Day 41</small>
            <Link to="/041_EtherSign">EtherSign</Link>
          </p>
          <p>
            <small>Day 42</small>
            <Link to="/042_P2PJam">P2PJam</Link>
          </p>
          <p>
            <small>Day 43</small>
            <Link to="/043_OffChainTicTacToe">Off-Chain Tic-Tac-Toe</Link>
          </p>
          <p>
            <small>Day 44</small>
            <Link to="/044_CoolHashes">Cool Hashes</Link>
          </p>
          <p>
            <small>Day 45</small>
            <Link to="/045_DStorage">DStorage</Link>
          </p>
          <p>
            <small>Day 46</small>
            <Link to="/046_Coinvote">Coinvote</Link>
          </p>
          <p>
            <small>Day 47</small>
            <Link to="/047_DecentralizedChatbot">Decentralized Chatbot</Link>
          </p>
          <p>
            <small>Day 48</small>
            <Link to="/048_ToyBlockchain">Toy Blockchain</Link>
          </p>
          <p>
            <small>Day 49</small>
            <Link to="/049_PaymentRequest">Payment Request</Link>
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
