import React, { Component } from "react";
import {
  SugarComponent,
  BackButton,
  ExternalLink,
  EthereumWrapper,
  EtherscanTxLink,
  EtherscanAddressLink,
  truncate
} from "../common";
import contractABI from "./abi";
import ReactLoading from "react-loading";
import { Link } from "react-router-dom";

import './index.css';

import Church from './church.png';
import Bar from "./bar.png";
import Title from './title.png';

const CONTRACT_ADDRESSES = {
  mainnet: "0x1b1981a32999ad581fb01487ffbb26f620ca917a",
  ropsten: "0x66c7d209a79fffa38f3a6ba9f691744b91310be7"
};

const GAS_LIMIT = 100000;
const FORGIVENESS_FEE = 10000000000000000;

class App extends SugarComponent {
  constructor() {
    super();
    this.state = {
      verificationStatus: null,
      forgivenessStatus: null,
      pendingTx: null
    };
  }

  async componentDidMount() {
    const contractInstance = new this.props.web3.eth.Contract(
      contractABI,
      CONTRACT_ADDRESSES[this.props.network]
    );
    await this.setStateAsync({ contractInstance });
    setInterval(this.refreshPending.bind(this), 1000);
  }

  async refreshPending() {
    if (this.state.pendingTx) {
      const { web3 } = this.props;
      const tx = this.state.pendingTx;
      const receipt = await web3.eth.getTransactionReceipt(tx);
      if (receipt === null) return;
      console.log(receipt);
      const forgivenessStatus = receipt.status === "0x1";
      console.log({forgivenessStatus});
      this.setState({ pendingTx: null, forgivenessStatus });
    }
  }

  async verifyForgiveness() {
    const { contractInstance } = this.state;
    const txHash = this._verifyInputEl.value;
    const isForgiven = await contractInstance.methods.isForgiven(txHash).call();
    this.setState({ verificationStatus: isForgiven });
  }

  async askForgiveness() {
    const { address, web3 } = this.props;
    const { contractInstance } = this.state;
    contractInstance.methods
      .askForgiveness(this._forgiveInputEl.value)
      .send({
        from: address,
        value: FORGIVENESS_FEE,
        gas: GAS_LIMIT
      })
      .on("transactionHash", hash => {
        console.log("got hash", hash);
        this.setState({ pendingTx: hash });
      });
  }

  shouldBeReadOnly () {
      return !this.props.hasWeb3 || CONTRACT_ADDRESSES[this.props.network] === undefined;
  }

  render() {
    return (
      <div id="main" style={{ textAlign: "center" }}>
        <img width={200} src={Church} />
        <br/>
        <img height={75} src={Title}  />
        <blockquote>
          If we confess our sins, He is faithful and just and will forgive us
          our sins and purify us from all unrighteousness.
        </blockquote>
        <div className="quote-author">
          <span>-- John 1:9</span>
        </div>
        <img height={50} src={Bar} />
        <ul>
          <p>HAVE YOU EVER:</p>
          <li>–  Sent ether to the wrong address or with the wrong amount?</li>
          <li>
            –  Made a purchase in the dark web that you now dearly regret?
          </li>
          <li>
            – Posted something that alienated everyone you loved in a
            blockchain-based social network?
          </li>
        </ul>
        <img height={50} src={Bar} />
        <div id="day002_box">
          <p>
            The bad news is that nothing you do on the blockchain can ever be
            forgotten.
          </p>
          <p>
            The good news is that <i>it can be forgiven.</i>
          </p>
          <p>
            As a self-appointed blockchain priest, I will forgive your sinful
            transactions, for only 0.01 ether.
          </p>
          <p>
            My forgiveness, like your sin, will live in the blockchain forever.
          </p>
          <p>
            God-loving individuals and smart contracts can verify that a
            transaction is forgiven and act accordingly.
          </p>
        </div>
        <p>Want to request forgiveness?</p>
        <div>
          {this.state.forgivenessStatus != null &&
            (this.state.forgivenessStatus ? (
              <div><p className="success-text">
                Your transaction has been forgiven.
              </p><button
              className="forgiveness-button"
                  onClick={() => {
                    this.setState({ forgivenessStatus: null });
                  }}
                >
                  Forgive more
                </button></div>
            ) : (
              <div>
                <span className="pending-tx">Transaction error</span>
                <button
                    className="forgiveness-button"
                  onClick={() => {
                    this.setState({ forgivenessStatus: null });
                  }}
                >
                  Try again
                </button>
              </div>
            ))}

          {this.state.forgivenessStatus === null &&
            (this.state.pendingTx === null ? (
              <div>
                <input
                  minLength={66}
                  maxLength={66}
                  className="forgiveness-input"
                  placeholder="Enter transaction hash..."
                  ref={el => {
                    this._forgiveInputEl = el;
                  }}
                />
                <button
                  disabled={this.shouldBeReadOnly()}
                  className="forgiveness-button"
                  onClick={this.askForgiveness.bind(this)}
                >
                  Request
                </button>
              </div>
            ) : (
              <span className="pending-tx">
                Pending confirmation (might take a minute):{" "}
                <EtherscanTxLink transaction={this.state.pendingTx} />
                <ReactLoading className="loading" type="spin" color="#444" />
              </span>
            ))}
        </div>
        <p>Want to verify forgiveness?</p>
        <div>
          <input
            minLength={66}
            maxLength={66}
            className="forgiveness-input"
            placeholder="Enter transaction hash..."
            ref={el => {
              this._verifyInputEl = el;
            }}
          />
          <button
            className="forgiveness-button"
            disabled={this.shouldBeReadOnly()}
            onClick={this.verifyForgiveness.bind(this)}
          >
            Verify
          </button>
          {this.state.verificationStatus != null &&
            (this.state.verificationStatus ? (
              <p className="success-text">
                This transaction has been forgiven.
              </p>
            ) : (
              <p className="fail-text">
                This transaction has not been forgiven.
              </p>
            ))}
        </div>
        <p>
          <EtherscanAddressLink
            network={this.props.network}
            address={CONTRACT_ADDRESSES[this.props.network]}
            text="View contract on Etherscan"
          />
        </p>
      </div>
    );
  }
}

const Wrapped = () => <EthereumWrapper supportedNetworks={Object.keys(CONTRACT_ADDRESSES)}><App/></EthereumWrapper>
export default Wrapped;
