import React, { Component } from "react";
import {
  SugarComponent,
  BackButton,
  ExternalLink,
  EthereumWrapper,
  EtherscanTxLink,
  EtherscanAddressLink,
  truncateStr,
  WithPendingTransaction
} from "../common";
import contractABI from "./abi";
import { sha256 } from 'js-sha256';
import { Link } from "react-router-dom";
import FaLock from 'react-icons/lib/fa/lock';
import FaUnlock from 'react-icons/lib/fa/unlock';

import "./index.css";

const CONTRACT_ADDRESSES = {
  ropsten: "0xcdae1edad78067b9091ddf76077a27e5d249d599"
};

const GAS_LIMIT = 300000;

const Secret = ({hash, secret, time}) => {
    const isRevealed = secret.length > 0;
    return (
        <div className='sk-secret'>
            {isRevealed ? <FaUnlock/> : <FaLock/>}
            <div className={`sk-tag ${isRevealed ? 'revealed' : 'concealed'}`}>
                {isRevealed ? "REVEALED" : "CONCEALED"}
            </div>
            <div className='secret-content'>{isRevealed ? secret : hash}</div>
            <div className='secret-date'>Submitted on Dec 28 2:35PM</div>
        </div>
    )
}

class App extends SugarComponent {
    constructor () {
        super()
        this.state = {
            secrets: [],
            pendingTx: null,
            lastAction: null,
            txSucceded: true,
            statusMsg: ''
        }
    }

  async componentDidMount() {
    const contractInstance = new this.props.web3.eth.Contract(
      contractABI,
      CONTRACT_ADDRESSES[this.props.network]
    );
    await this.setStateAsync({ contractInstance });
    await this.getSecrets();
    setInterval(this.refreshPending.bind(this), 1000);
  }

  async getSecrets () {
    const { contractInstance } = this.state;
    const numberOfSecrets = await contractInstance.methods.numberOfSecrets().call();
    let secrets = []
    for (var i = numberOfSecrets-1; i >= 0; i--) { 
        const result = await contractInstance.methods.getSecretByIndex(i).call();
        const secret = {
            hash: result[0],
            secret: result[1], 
            address: result[2], 
            date: new Date(Number(result[3]) * 1000)
        };
        secrets.push(secret);
    }
    console.log(secrets);
    await this.setStateAsync({secrets})
  }

  async refreshPending() {
    if (this.state.pendingTx) {
      const { web3 } = this.props;
      const {pendingTx, lastAction} = this.state;
      const receipt = await web3.eth.getTransactionReceipt(pendingTx);
      if (receipt === null) return;
      const txSucceded = receipt.status === "0x1";
      let statusMsg;
      if (lastAction === 'store') {
          if (txSucceded) statusMsg = 'Secret stored successfully.'
          else statusMsg = 'Failed to store secret.'
      } else {
          if (txSucceded) statusMsg = 'Secret revealed successfully.'
          else statusMsg = 'Failed to reveal secret.'
      }
      this.setState({ pendingTx: null, txSucceded, statusMsg });
      this._inputEl.value = '';
    }
  }

    async storeSecret () {
        const hashed = '0x'+sha256(this._inputEl.value);
        const { address, web3 } = this.props;
        const { contractInstance } = this.state;
        contractInstance.methods
          .addSecret(hashed)
          .send({
            from: address,
            gas: GAS_LIMIT
          })
          .on("transactionHash", hash => {
            this.setState({ lastAction: 'store', pendingTx: hash });
          });
    }

    async revealSecret () {
        const { address, web3 } = this.props;
        const { contractInstance } = this.state;
        contractInstance.methods
          .revealSecret(this._inputEl.value)
          .send({
            from: address,
            gas: GAS_LIMIT
          })
          .on("transactionHash", hash => {
            this.setState({ lastAction: 'reveal', pendingTx: hash });
          });
    }

    render () {
        const {secrets, pendingTx, statusMsg, txSucceded} = this.state;
        return <div id='sk-main'><div id='sk-head'>
                <img width={100} src='http://laoblogger.com/images/clipart-shhh-7.jpg' />
                <h1>Secret Keeper</h1>
                <p>Store a secret message on the Ethereum blockchain.</p>
                <p>Reveal it whenever you want with public proof of the time of submission.</p>
                </div>
            <div id='sk-body'>
            <div id='sk-left'>
                <h2>Store/Reveal Secret</h2>
                <p>
                    <textarea 
                        placeholder='Your secret...' 
                        className='sk-input' 
                        ref={(el) => { this._inputEl = el }}/>
                </p>
                <WithPendingTransaction
                    web3={this.props.web3}
                    transaction={pendingTx}
                    network={this.props.network}
                    >
                <div>
                    <button disabled={!this.props.isNetworkSupported} onClick={this.storeSecret.bind(this)}>Store</button> 
                    {' '}or{' '}
                    <button disabled={!this.props.isNetworkSupported} onClick={this.revealSecret.bind(this)}>Reveal</button>
                </div>
                {statusMsg && <p className={`status-msg ${txSucceded ? 'success-text' : 'fail-text'}`}>
                    {statusMsg}
                </p>}
                </WithPendingTransaction>
            </div>
            <div id='sk-right'>
                <h2>Gallery of Secrets</h2>
                <small>(reverse chronological order)</small>
                {secrets.map((secret, index) => {
                    return <Secret key={index} {...secret}/>
                })}
            </div>
            </div>
        <p style={{textAlign: 'center'}}>
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
