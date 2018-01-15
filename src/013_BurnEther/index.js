import React, { Component } from "react";
import {
  SugarComponent,
  BackButton,
  ExternalLink,
  EthereumWrapper,
  EtherscanTxLink,
  EtherscanAddressLink,
  truncate,
  WithPendingTransaction,
  uploadStringToIpfs,
  ipfsCat
} from "../common";
import contractABI from "./abi";
import BurnIcon from './burn.png';
import "./index.css";
import FaFire from 'react-icons/lib/fa/fire';

const GAS_LIMIT = 300000;

const CONTRACT_ADDRESSES = {
  ropsten: "0x182565736075fcee6b185bdbc7fe1b0505ca0f76"
};

const getETHUSD = async () => {
    const resp = await fetch('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD');
    const obj = await resp.json();
    return obj.USD;
}

class App extends SugarComponent {
    constructor () {
        super();
        this.state = {
            amount: 0,
            totalETH: 0,
            totalUSD: 0,
            pendingBurnTx: null
        };
    }

    async refreshDapp () {
        const { web3 } = this.props;
        const { contractInstance } = this.state;
        const total = await contractInstance.methods.valueDestroyed().call();
        const totalETH = web3.utils.fromWei(total);
        const totalUSD = (await getETHUSD()) * totalETH;
        this.setStateAsync({ totalETH, totalUSD });
    }

    async componentDidMount() {
        const contractInstance = new this.props.web3.eth.Contract(
            contractABI,
            CONTRACT_ADDRESSES[this.props.network]
        );
        await this.setStateAsync({ contractInstance });
        await this.refreshDapp();
    }

    async burn () {
        const { web3, address } = this.props;
        const { contractInstance, amount } = this.state;
        contractInstance
          .methods
          .burn('')
          .send({ 
              value: web3.utils.toWei(amount.toString()),
              from: this.props.address, 
              gas: GAS_LIMIT
          })
          .on("transactionHash", hash => {
            this.setState({ pendingBurnTx: hash });
          });
    }

    render () {
        return <div id="burn-main">
            <img src={BurnIcon} width={175} />
            <h2>Burn any amount of Ether.</h2>
            <div>
              Why?
              <ul>
                <li>To protest an injustice.</li>
                <li>To make an artistic statement.</li>
                <li>To raise the value of the remaining ethers.</li>
              </ul>
            </div>
            <h3>This action is permanent.</h3>
            <p>
              <input min="0" step="0.1" type="number" value={this.state.amount} onChange={evt => this.setState(
                    { amount: evt.target.value }
                  )} /> ether{" "}
            </p>
            <div>
              <WithPendingTransaction web3={this.props.web3} transaction={this.state.pendingBurnTx} successMsg="Your ether has been burned." onFinish={this.refreshDapp.bind(this)}>
                <button onClick={this.burn.bind(this)} disabled={!this.props.isNetworkSupported}>
                  <FaFire /> Burn
                </button>
              </WithPendingTransaction>
              <p>Total amount burned: {this.state.totalETH} ether</p>
              
            </div>
            <div>
              <ExternalLink href='https://ethereum.stackexchange.com/a/17617'>Implementation details</ExternalLink>
            </div>
            <div>
              <EtherscanAddressLink network={this.props.network} address={CONTRACT_ADDRESSES[this.props.network]} text="View contract on Etherscan" />
            </div>
          </div>;
    }
}

const Wrapped = () => (
  <EthereumWrapper mainNetwork="ropsten" supportedNetworks={["ropsten"]}>
    <App />
  </EthereumWrapper>
);
export default Wrapped;
