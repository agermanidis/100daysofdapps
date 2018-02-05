import React, { Component } from "react";
import {
  SugarComponent,
  BackButton,
  ExternalLink,
  EthereumWrapper,
  EtherscanTxLink,
  EtherscanAddressLink,
  truncateStr,
  WithPendingTransaction,
  uploadStringToIpfs,
  uploadFileToIpfs,
  ipfsCat,
  ipfsURL
} from "../common";
import contractABI from "./abi";
import "./index.css";

import P5Wrapper from "react-p5-wrapper";
import sketch from "./sketch";
import { setInterval } from "timers";


const CONTRACT_ADDRESSES = {
  ropsten: "0xd03C63B26ba5cE8A3049A82ECB09994E32467CE0"
};

const GAS_LIMIT = 300000;

class App extends SugarComponent {
    constructor () {
        super();
        this.state = {
            mood: 0.5,
            amount: 0,
            pendingTx: null,
            displayLiveText: false
        };
    }

    async refreshDapp () {
        const { web3, address } = this.props;
        const { contractInstance } = this.state;
        
        const moodExp = await contractInstance.methods
            .getMood()
            .call({from: address});

        this.setState({ mood: Math.max(0, Math.min(10, Math.log(parseInt(moodExp)))) / 10 });
    }

    async componentDidMount () {
      const contractInstance = new this.props.web3.eth.Contract(
        contractABI,
        CONTRACT_ADDRESSES[this.props.network]
      );
      await this.setStateAsync({ contractInstance });
      await this.refreshDapp();
      setInterval(() => { 
        this.setState({displayLiveText: !this.state.displayLiveText});
      }, 1000);
    }

    async payTribute () {
      const { web3, address } = this.props;
      const { contractInstance, amount } = this.state;
      contractInstance.methods
        .payTribute()
        .send({
          value: web3.utils.toWei(amount),
          from: this.props.address, 
          gas: GAS_LIMIT 
        })
        .on("transactionHash", hash => {
            this.setState({ pendingTx: hash });
        });
    }

    render () {
      const { amount, mood, displayLiveText, pendingTx } = this.state;
      
      return <div id="tributes">
          <p>
            This is smart contract <EtherscanAddressLink network={this.props.network} address={CONTRACT_ADDRESSES[this.props.network]} text={CONTRACT_ADDRESSES[this.props.network]} />.
          </p>
          <p>Let's see how the contract is doing.</p>
          <div>
            <div id="live-feed-text" style={{ opacity: displayLiveText ? 1 : 0 }}>
              LIVE FEED
            </div>
            <P5Wrapper sketch={sketch} mood={mood} />
          </div>
          <p>
            Make the smart contract happy by paying it tributes,
            frequently and handsomely.
          </p>
          <p>
            <input min="0" step="0.1" type="number" value={amount} onChange={evt => this.setState(
                  { amount: evt.target.value }
                )} /> ether
          </p>
          <WithPendingTransaction web3={this.props.web3} transaction={pendingTx}>
            <button disabled={!this.props.isNetworkSupported} onClick={this.payTribute.bind(this)}>
              Pay tribute
            </button>
          </WithPendingTransaction>
          <p>
            <EtherscanAddressLink network={this.props.network} address={CONTRACT_ADDRESSES[this.props.network]} text="View contract on Etherscan" />
          </p>
        </div>;
    }
}


const Wrapped = () => (
  <EthereumWrapper
    mainNetwork="ropsten"
    supportedNetworks={Object.keys(CONTRACT_ADDRESSES)}
  >
    <App />
  </EthereumWrapper>
);
export default Wrapped;



