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
import registryABI from './registry_abi';
import Flag from './flag';
import _ from 'underscore';
import update from 'immutability-helper';

import './index.css';

const GAS_LIMIT_CREATE = 4000000;
const GAS_LIMIT = 300000;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const CONTRACT_ADDRESSES_REGISTRY = {
  ropsten: "0xfc429d03bdea191f6afde96d40d832fcf39f3fab"
};

class App extends SugarComponent {
  constructor() {
    super();
    this.state = {
      name: "",
      symbol: "",
      citizens:[],
      initialSupply: 100000,
      supply: 0,
      exists: false,
      nonce: 0,
      addCitizenAddr: '',
      pendingCreateTx: null,
      pendingAddTx: null,
      pendingTaxTx: null,
      transferVals: {},
      taxation: 30
    };
  }

  async refreshDapp () {
    const { registryContractInstance } = this.state;
    const existingAddress = await registryContractInstance.methods.ownerToCountry(this.props.address).call();
    if (existingAddress != ZERO_ADDRESS) {
        const contractInstance = new this.props.web3.eth.Contract(
          contractABI,
          existingAddress
        );
        const name = await contractInstance.methods.name().call();
        const symbol = await contractInstance.methods.symbol().call();
        const supply = await contractInstance.methods.totalSupply().call();
        const myBalance = await contractInstance.methods.balances(this.props.address).call();
        const flagHash = await contractInstance.methods.flagHash().call();
        const flagSVG = await ipfsCat(flagHash);
        const numberOfCitizens = await contractInstance.methods.numberOfCitizens().call();
        let citizens = [];
        for (var i = 0; i < numberOfCitizens; i++) {
            const address = await contractInstance.methods.citizens(i).call();
            const balance = await contractInstance.methods.balances(address).call();
            citizens.push({address, balance});
        }
        await this.setStateAsync({ 
            exists: true, 
            contractInstance, 
            name, 
            symbol, 
            supply, 
            flagSVG, 
            myBalance, 
            citizens 
        });
    }
  }

  async componentDidMount() {
    const registryContractInstance = new this.props.web3.eth.Contract(
      registryABI,
      CONTRACT_ADDRESSES_REGISTRY[this.props.network]
    );
    await this.setStateAsync({ registryContractInstance });
    await this.refreshDapp();
  }

  async startCountry() {
    const { web3, address } = this.props;
    const { name, symbol, initialSupply, registryContractInstance } = this.state;
    const flagHash = await uploadStringToIpfs(this.flagEl.outerHTML);
    registryContractInstance
      .methods
      .createCountry(name, symbol, flagHash, initialSupply + "0".repeat(18))
      .send({ 
          from: this.props.address, 
          gas: GAS_LIMIT_CREATE
      })
      .on("transactionHash", hash => {
        this.setState({ pendingCreateTx: hash });
      });
  }

  async addCitizen () {
    const { web3, address } = this.props;
    const { addCitizenAddr, contractInstance } = this.state;

    contractInstance.methods
      .addCitizen(addCitizenAddr)
      .send({ from: this.props.address, gas: GAS_LIMIT })
      .on("transactionHash", hash => {
        this.setState({ pendingAddTx: hash });
      });

  }

  async taxEveryone () {
    const { web3, address } = this.props;
    const { taxation, contractInstance } = this.state;

    contractInstance.methods
      .collectTaxesFromEveryone(taxation)
      .send({ from: this.props.address, gas: GAS_LIMIT })
      .on("transactionHash", hash => {
        this.setState({ pendingTaxTx: hash });
      });
  }

  render() {
    const { 
        flagSVG, 
        exists, 
        nonce, 
        name, 
        symbol, 
        supply, 
        initialSupply, 
        myBalance, 
        citizens,
        addCitizenAddr,
        taxation,
        transferVals
    } = this.state;
    console.log('citizens', citizens);
    return <div id="aut-main">
        <h1>Autocracy</h1>
        {exists && <div>
            <div id="flag-container" dangerouslySetInnerHTML={{ __html: flagSVG }} />
            <h2>{name}</h2>
            <p id="total-supply">
              Total supply: {Math.round(supply / 10 ** 18)} {symbol}
            </p>
            <p id="total-supply">
              Your Balance: {Math.round(myBalance / 10 ** 18)} {symbol}
            </p>
            <p>
              <WithPendingTransaction web3={this.props.web3} onFinish={() => this.refreshDapp()} transaction={this.state.pendingTaxTx}>
                <input type='number' value={taxation} onChange={(evt)=>{this.setState({taxation: evt.target.value})}} placeholder='rate' />%
                {' '}
                <button onClick={this.taxEveryone.bind(this)} disabled={!this.props.isNetworkSupported || !taxation}>
                  Collect Taxes
                </button>
              </WithPendingTransaction>
            </p>
            <h3>
              <u>Your Citizens</u>
              <div id="citizens">
                {citizens.map(({address, balance}, idx) => {
                  return <div key={idx}>
                      <EtherscanAddressLink address={address} network={this.props.network} />
                      <div>
                        Balance:{" "}
                        {Math.round(balance / 10 ** 18)}
                      </div>
                      {/* <div>
                          Transfer:{' '}
                          <input 
                            style={{width: '100px'}}
                            type='number'
                            value={transferVals[idx] || 0} 
                            onChange={(evt)=>{
                                this.setState(update(this.state, {transferVals: {[idx]: {$set: evt.target.value}}}))
                            }}/>{' '} {symbol}
                      </div> */}
                    </div>;
                })}
              </div>
              <div>
                <input value={addCitizenAddr} onChange={evt => this.setState(
                      { addCitizenAddr: evt.target.value }
                    )} id="add-citizen" placeholder={ZERO_ADDRESS} />
                <WithPendingTransaction web3={this.props.web3} onFinish={() => this.refreshDapp()} transaction={this.state.pendingAddTx}>
                  <button onClick={this.addCitizen.bind(this)} disabled={!this.props.isNetworkSupported || !addCitizenAddr}>
                    Add Citizen
                  </button>
                </WithPendingTransaction>
              </div>
            </h3>
          </div>}
        {!exists && <div id='not-exists'>
            <p>Start a fictional country on the blockchain.</p>
            <p>Control the money supply, approve new citizens, collect taxes.</p>
            <div id="create-country">
              <div id="flag-container">
                <Flag reference={el => (this.flagEl = el)} nonce={nonce} />
              </div>
              <button id="regenerate-flag" onClick={() => this.setState({
                    nonce: Math.random()
                  })}>
                Regenerate Flag
              </button>
              <p>
                Country Name:
                <input value={name} placeholder="Atlantis" onChange={evt => this.setState(
                      { name: evt.target.value }
                    )} />
              </p>
              <p>
                Currency Symbol:
                <input value={symbol} placeholder="ATL" onChange={evt => this.setState(
                      { symbol: evt.target.value }
                    )} />
              </p>
              <p>
                Initial Supply:
                <input type="number" value={initialSupply} placeholder="Initial Supply" onChange={evt => this.setState(
                      { symbol: evt.target.value }
                    )} />
              </p>

              <WithPendingTransaction web3={this.props.web3} onFinish={() => this.refreshDapp()} transaction={this.state.pendingCreateTx}>
                <button id='start-country' onClick={this.startCountry.bind(this)} disabled={!this.props.isNetworkSupported || !name || !symbol}>
                  Start Country
                </button>
              </WithPendingTransaction>
            </div>
          </div>}
      </div>;
  }
}

const Wrapped = () => (
  <EthereumWrapper
    mainNetwork="ropsten"
    supportedNetworks={['ropsten']}>
    <App />
  </EthereumWrapper>
);
export default Wrapped;
