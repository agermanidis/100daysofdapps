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

import DictionaryIcon from './dictionary.ico';
import dictionary from "./dictionary_top10k_abridged.json";

import "./index.css";

const CONTRACT_ADDRESSES = {
  ropsten: "0x909bc123cc694e9e74c8aec6543c60b4eb6f5fdf"
};

const GAS_LIMIT = 300000;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

class App extends SugarComponent {
  constructor() {
    super();
    this.state = {
      currentWord: "",
      currentTokenId: 0,
      currentTokenExists: false,
      currentTokenOwner: 0,
      currentTokenPrice: 0,
      currentTokenIsForSale: false,
      pendingTx: null,
      txSucceded: true,
      statusMsg: "",
      balance: 0
    };
  }

  wordChanged(event) {
    const word = event.target.value;
    this.setStateAsync({ currentWord: word, currentWordOwner: ZERO_ADDRESS });
    requestAnimationFrame(async () => {
      await this.refreshDapp();
    })
  }

  async refreshDapp () {
      const { contractInstance, currentWord } = this.state;
      const tokenId = await contractInstance.methods.stringToId(currentWord).call();
      const owner = await contractInstance.methods.ownerOf(tokenId).call();
      const exists = owner !== ZERO_ADDRESS;
      const ownedByMe = owner === this.props.address;
      let forSale = false;
      let price = 0;
      if (owner !== ZERO_ADDRESS) {
        forSale = await contractInstance.methods.isTokenForSale(tokenId).call();
        if (forSale) {
          price = await contractInstance.methods.salePrice(tokenId).call();
        }
      }
      await this.setStateAsync({
        currentTokenExists: exists,
        currentTokenId: tokenId,
        currentTokenOwner: owner,
        currentTokenOwnedByMe: ownedByMe,
        currentTokenPrice: price,
        currentTokenIsForSale: forSale
      })
    
  }

  async setupContract() {
    const contractInstance = new this.props.web3.eth.Contract(
      contractABI,
      CONTRACT_ADDRESSES[this.props.network]
    );
    await this.setStateAsync({ contractInstance });
  }

  async componentDidMount() {
    await this.setupContract();
    setInterval(this.refreshPending.bind(this), 1000);
  }

  async refreshPending() {
    if (this.state.pendingTx) {
      const { web3 } = this.props;
      const { pendingTx, lastAction } = this.state;
      const receipt = await web3.eth.getTransactionReceipt(pendingTx);
      if (receipt === null) return;
      const txSucceded = receipt.status === "0x1";
      let statusMsg;
      if (lastAction === "withdraw") {
        if (txSucceded) statusMsg = "Withdrawn ether successfully.";
        else statusMsg = "Failed to withdraw ether.";
      } else {
        if (txSucceded) statusMsg = "Deposited ether successfully.";
        else statusMsg = "Failed to deposit ether.";
      }
      this.setState({ pendingTx: null, txSucceded, statusMsg });
      await this.refreshDapp();
    }
  }

  async createToken() {
    const { address, web3 } = this.props;
    const { contractInstance, currentWord } = this.state;
    contractInstance.methods
      .createToken(currentWord)
      .send({
        from: address,
        gas: GAS_LIMIT
      })
      .on("transactionHash", hash => {
        this.setState({ lastAction: "create", pendingTx: hash });
      });
  }

  render() {
    const {
      currentWord, 
      currentTokenId,
      currentTokenExists, 
      currentTokenOwner,
      pendingTx,
      currentTokenOwnedByMe } = this.state;
    return <div id="wm-main">
        <img height={150} src={DictionaryIcon} />
        <h1>Word Market</h1>
        <h3>
          Turn any English word into a unique <ExternalLink href="https://medium.com/crypto-currently/the-anatomy-of-erc721-e9db77abfc24">
            ERC721
          </ExternalLink>-compatible token.
        </h3>

        <input value={currentWord} onChange={this.wordChanged.bind(this)} type="text" placeholder="Search for a word..." />

        {currentWord && <div>
            <p className="word-definition">
              Definition:{" "}
              {dictionary[currentWord] ||
                "No definition found for this word."}
            </p>
            <WithPendingTransaction transaction={pendingTx}>
              {!currentTokenExists ? <div>
                  <p>
                    The token for "{currentWord}" does not yet exist. Would
                    you like to create it?
                  </p>
                  <button disabled={!this.props.isNetworkSupported} onClick={this.createToken.bind(this)}>
                    Create Token
                  </button>
                </div> : <div>
                  {currentTokenOwnedByMe ? <p>You own the token for "{currentWord}."</p> : <p>
                      This word is owned by <EtherscanAddressLink network={this.props.network} address={currentTokenOwner} />.
                    </p>}
                  <p><small>Token ID: {currentTokenId}</small></p>
                </div>}
            </WithPendingTransaction>
          </div>}
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
