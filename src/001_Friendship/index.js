import React, { Component } from 'react';
import { 
  SugarComponent,
  BackButton,
  ExternalLink,
  EthereumWrapper, 
  EtherscanTxLink, 
  EtherscanAddressLink,
  truncate
} from '../common';
import contractABI from './abi';
import ReactLoading from "react-loading";
import { Link } from "react-router-dom";

import './index.css';

const CONTRACT_ADDRESSES = {
  mainnet: "0x1955a08c4f4e3edc8323b60f792ffc47141538a6",
  ropsten: "0xf754b62a7a3a9ad4c3b9a75c0a3f02dd0779a895"
};
const GAS_LIMIT = 100000;

class App extends SugarComponent {
  constructor() {
    super();
    this.state = {
      pendingTx: null,
      contractInstance: null,
      isFriend: false,
      numberOfFriends: 0,
      latestFriend: "0x0000000000000000000000000000000000000000"
    };
  }

  async componentDidMount() {
    console.log(this.props.web3);
    const contractInstance = new this.props.web3.eth.Contract(contractABI, CONTRACT_ADDRESSES[this.props.network]);
    await this.setStateAsync({ contractInstance });
    await this.refreshInfo();
    setInterval(this.refreshPending.bind(this), 1000);
  }

  async refreshInfo () {
    const { contractInstance } = this.state;
    const numberOfFriends = await contractInstance.methods.numberOfFriends().call();
    const latestFriend = await contractInstance.methods.latestFriend().call();
    const isFriend = await contractInstance.methods.friendsWith(this.props.address).call();
    await this.setStateAsync({ numberOfFriends, latestFriend, isFriend });   
  }

  async refreshPending() {
    if (this.state.pendingTx) {
      const { web3 } = this.props;
      const tx = this.state.pendingTx;
      const receipt = await web3.eth.getTransactionReceipt(tx);
      this.setState({pendingTx: null});
      await this.refreshInfo();
    }
  }

  async becomeFriends(evt) {
    const { address, web3 } = this.props;
    const { contractInstance } = this.state;
    contractInstance.methods.becomeFriendsWithMe().send({
      from: address, 
      gas: GAS_LIMIT
    })
    .on('transactionHash', (hash) => {
      this.setState({ pendingTx: hash });
    })
  }

  render() {
    let statusEl;
    if (this.state.pendingTx) {
      statusEl = <span className="pending-tx">
          Pending confirmation:
          <EtherscanTxLink transaction={this.state.pendingTx}>
            {truncate(this.state.pendingTx)}
          </EtherscanTxLink>
          <ReactLoading className="loading" type="spin" color="#444" />
        </span>;
    } else if (this.state.isFriend) {
      statusEl = <p style={{ color: "rgb(39, 150, 39)" }}>We are friends!</p>;
    } else {
      statusEl = (
        <button
            onClick={this.becomeFriends.bind(this)} 
            disabled={!this.props.hasWeb3}>
          Become friends with me
        </button>
      );
    }

    return (
      <div id="main">        
        <h1>Friendship Contract</h1>
        <p>Nice to meet you, {this.props.address ? <EtherscanAddressLink address={this.props.address}/> : "stranger"}.</p>
        <p>I am <EtherscanAddressLink address='0x02f807d30DcA3bAb5C5b010F5D9a05e4876dcaB8'/>.</p>
        <p>I want to be your friend, but only if it's public and forever.</p>
        <p>On the blockchain, everything is public and forever.</p>
        <p>Will you please be my friend, publicly, forever?</p>
        {statusEl}
        <p>
          <b>Number of friends:</b> {this.state.numberOfFriends}
        </p>
        <p>
          <b>Latest Friend:</b>{' '}
          <EtherscanAddressLink address={this.state.latestFriend} />
        </p>
        <p>
          <b>Friendship Smart Contract:</b>{" "}
          <EtherscanAddressLink address={CONTRACT_ADDRESSES[this.props.network]}>
            View on Etherscan
          </EtherscanAddressLink>
        </p>
      </div>
    );
  }
}

const Wrapped = () => <EthereumWrapper supportedNetworks={Object.keys(CONTRACT_ADDRESSES)}><App/></EthereumWrapper>
export default Wrapped;
