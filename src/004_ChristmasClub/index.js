import React, { Component } from "react";
import {
  SugarComponent,
  BackButton,
  ExternalLink,
  EthereumWrapper,
  EtherscanTxLink,
  EtherscanAddressLink,
  truncate,
  WithPendingTransaction
} from "../common";
import contractABI from "./abi";
import { sha256 } from 'js-sha256';
import SantaHat from './santahat.png';

import moment from 'moment';

import "./index.css";

const CONTRACT_ADDRESSES = {
  ropsten: "0xbd068fb582d904616230e4c8cf87b45a62670cd7"
};

const GAS_LIMIT = 300000;

const Separator = () => <div className='separator'></div>

class App extends SugarComponent {
    constructor () {
        super()
        this.state = {
            pendingTx: null,
            txSucceded: true,
            statusMsg: '',
            balance: 0
        }
    }

  async componentDidMount() {
    const contractInstance = new this.props.web3.eth.Contract(
      contractABI,
      CONTRACT_ADDRESSES[this.props.network]
    );
    await this.setStateAsync({ contractInstance });
    const withdrawalTime = await contractInstance.methods.withdrawalTime().call();
    await this.setStateAsync({ contractInstance, withdrawalTime });
    await this.refreshBalance();
    setInterval(this.refreshPending.bind(this), 1000);
  }

  async refreshBalance () {
    const { address } = this.props;
    const { contractInstance } = this.state;
    const balance = await contractInstance.methods.getBalance().call({from: address});
    const withdrawalTime = await contractInstance.methods.withdrawalTime().call();
    console.log(withdrawalTime);
    await this.setStateAsync({ balance, withdrawalTime });
  }

  isPastWithdrawalTime () {
    const { withdrawalTime } = this.state
    const diffTime = withdrawalTime*1000 - new Date().getTime();
    return diffTime <= 0;
  }

  countdown () {
      const { withdrawalTime } = this.state
      const diffTime = withdrawalTime*1000 - Date.now();
      const duration = moment.duration(diffTime, 'milliseconds');
      return `${duration.months()} months, ${duration.days()} days, ${duration.hours()} hours, ${duration.minutes()} minutes, ${duration.seconds()} seconds`;
  }

  async refreshPending() {
    if (this.state.pendingTx) {
      const { web3 } = this.props;
      const {pendingTx, lastAction} = this.state;
      const receipt = await web3.eth.getTransactionReceipt(pendingTx);
      if (receipt === null) return;
      const txSucceded = receipt.status === "0x1";
      let statusMsg;
      if (lastAction === 'withdraw') {
          if (txSucceded) statusMsg = 'Withdrawn ether successfully.'
          else statusMsg = 'Failed to withdraw ether.'
      } else {
          if (txSucceded) statusMsg = 'Deposited ether successfully.'
          else statusMsg = 'Failed to deposit ether.'
      }
      this.setState({ pendingTx: null, txSucceded, statusMsg });
      this._inputEl.value = '';
      
    }
    await this.refreshBalance();
  }

    async withdraw () {
        const hashed = '0x'+sha256(this._inputEl.value);
        const { address, web3 } = this.props;
        const { contractInstance } = this.state;
        contractInstance.methods
          .withdraw()
          .send({
            from: address,
            gas: GAS_LIMIT
          })
          .on("transactionHash", hash => {
            this.setState({ lastAction: 'store', pendingTx: hash });
          });
    }

    async deposit () {
        const { address, web3 } = this.props;
        console.log('deposit', address);
        const { contractInstance } = this.state;
        contractInstance.methods
          .deposit()
          .send({
            value: web3.utils.toWei(this._inputEl.value),
            from: address,
            gas: GAS_LIMIT
          })
          .on("transactionHash", hash => {
            this.setState({ lastAction: 'reveal', pendingTx: hash });
          });
    }

    render () {
        const {balance, pendingTx} = this.state;
        return <div id='cc-main'>
            <div id='cc-head'>
            <img width={100} src={SantaHat} />
            <h1>Christmas Club</h1>
            <p>Safely deposit Ether throughout the year.</p>
            <p>Retrieve it on December 1st, 2018, just in time for Christmas season.</p>
            <p>Prevent yourself from reckless spending throughout the year.</p>
            <p>There is a 3% fee if you withdraw early.</p>
            </div>
            <p>Countdown: {
                this.isPastWithdrawalTime()
                ? (<b>It's time to withdraw!</b>)
                : (<b>{this.countdown()}</b>)
            }</p>
            <WithPendingTransaction transaction={pendingTx}>
            <div id='cc-body'>
            <div><p>Your Balance: <b>{this.props.web3.utils.fromWei(balance.toString())} ether</b></p>
            <button 
                    disabled={!this.props.isNetworkSupported} 
                    onClick={this.withdraw.bind(this)}>
                    {this.isPastWithdrawalTime() ? 'Make Withdrawal' : 'Make Early Withdrawal (3% fee)'}
                </button>
            </div><div>
                <p>Deposit:{' '} 
                    <input 
                        ref={(el) => {this._inputEl = el }} 
                        type="number" 
                        step="0.1" 
                        placeholder='Enter amount...' /> ether</p>
                <button 
                    disabled={!this.props.isNetworkSupported} 
                    onClick={this.deposit.bind(this)}>
                    Make Deposit
                </button> 
            </div>
            </div>
            </WithPendingTransaction>
            <p>
                Inspired by a <ExternalLink href='https://en.wikipedia.org/wiki/Christmas_club'>popular early 20th century savings program</ExternalLink>.
            </p>
            <p>
            <EtherscanAddressLink
              network={this.props.network}
              address={CONTRACT_ADDRESSES[this.props.network]}
              text="View contract on Etherscan"
            />
            </p>
        </div>
    }
}

const Wrapped = () => (
  <EthereumWrapper 
    mainNetwork='ropsten'
    supportedNetworks={Object.keys(CONTRACT_ADDRESSES)}>
    <App />
  </EthereumWrapper>
);
export default Wrapped;
