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
  ipfsURL,
  NewPostInput,
  isValidEthAddress,
  ZERO_ADDRESS
} from "../common";
import { TextInput } from "../styles";
import IntroducingImage from "./introducing.png";
import styled from "styled-components";
import MdSend from "react-icons/lib/md/send";
import contractABI from './abi';

const CLAIM_SERVER = 'https://rpc-email-server-ltufhzzccs.now.sh';

const GAS_LIMIT = 300000;

const CONTRACT_ADDRESSES = {
  ropsten: "0x79d4b0d6fc3e27d59da720c06fc9551fff3a08fb"
};

const StyledInput = styled.input`
  border: none;
  border-bottom: 1px dashed gray;
  outline: none;
  font-size: 1em;
  text-align: left;
  margin: auto 0.25em;
  padding: 0.3em;
`;

const StyledNumberInput = styled(StyledInput)`
  width: 100px;
`;

const AddressInput = styled(StyledInput)`
  width: 550px;
`;

const NumberInput = props => {
  return <StyledNumberInput min="0" step="0.1" type="number" {...props} />;
};

const SmallButton = styled.button`
  margin: 0 1em;
  font-size: 0.9em;
  padding: 0.5em;
`;

class App extends SugarComponent {
  state = {
    freeCoinAddr: "",
    amountToSend: 0,
    balance: '0',
    recipientAddress: "",
    isVerified: false,
    didSubmitEmail: false,
    mintingFinished: false,
    pendingTx: null
  };

  async refreshDapp() {
    const { contractInstance } = this.state;
    const { address } = this.props;
    const balance = await contractInstance.methods.balanceOf(address).call();
    const isVerified = await contractInstance.methods.verified(address).call();
    const mintingFinished = await contractInstance.methods.mintingFinished().call();
    this.setState({ balance, isVerified, mintingFinished });
  }

  async componentDidMount() {
    const contractInstance = new this.props.web3.eth.Contract(
      contractABI,
      CONTRACT_ADDRESSES[this.props.network]
    );
    await this.setStateAsync({ contractInstance });
    await this.refreshDapp();
  }

  async transfer () {
      const { web3 } = this.props;
      const { contractInstance, amountToSend, recipientAddress } = this.state;
      contractInstance.methods
          .transfer(recipientAddress, web3.utils.toWei(amountToSend.toString()))
          .send({
            from: this.props.address,
            gas: GAS_LIMIT
          })
          .on("transactionHash", hash => {
            this.setState({ pendingTx: hash });
          });
        }
  
  async claimCoins () {
    const { address } = this.props;
    const { freeCoinAddr } = this.state;
    await fetch(CLAIM_SERVER+'/request', {
      method: 'post',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
            ethAddress: address,
            email: freeCoinAddr
    })})
    this.setState({didSubmitEmail: true});
  }

  render() {
    const { web3 } = this.props;
    const { 
        pendingTx,
        balance, 
        freeCoinAddr, 
        amountToSend, 
        isVerified, 
        recipientAddress,
        didSubmitEmail } = this.state;
    return (
      <div style={{ fontFamily: "Avenir", textAlign: "center", margin: "2em auto", width: '75%'}}>
        <img src={IntroducingImage} width={400} />
        <p>
          The Recently Possible Coin (or RPC) is a new cryptocurrency that taps
          into the collective inventiveness, wisdom, and productivity of the{" "}
          <ExternalLink href="http://tisch.nyu.edu/itp">NYU ITP</ExternalLink>{" "}
          community.
        </p>

        <br />
        <h3>Your balance</h3>
        <p>You currently have {web3.utils.fromWei(balance)} RPC.</p>
        <br />

        <h3>Send RPC to another address</h3>
        
        <WithPendingTransaction
            web3={this.props.web3}
            transaction={pendingTx}
            network={this.props.network}
            onFinish={() => {
                this.setState({ amountToSend: 0, recipientAddress: '' });
                this.refreshDapp(); 
            }}
                    >
        <p>
          Send{" "}
          <b>
            <NumberInput
              min="0"
              step="1"
              max={balance}
              value={amountToSend}
              onChange={evt =>
                this.setState({ amountToSend: evt.target.value })
              }
            />{" "}
            RPC
          </b>{" "}
          to <AddressInput 
            value={recipientAddress}
            onChange={(evt) => this.setState({recipientAddress: evt.target.value})}
            placeholder="Recipient address" />{" "}
          <SmallButton
            disabled={!this.props.isNetworkSupported}
            onClick={this.transfer.bind(this)}>
            <MdSend /> Send
          </SmallButton>
        </p>
        </WithPendingTransaction>
        <br />

        {isVerified 
        ? <p>You have already claimed your free coins.</p>
        :<div>
        <h3>Are you affiliated with ITP?</h3>
        <p>
          Students, teachers, alums, residents, and staff of ITP are eligible to
          receive 1,000 free RPCs.
        </p>
        <p>
          You will need to claim your free coins by midnight EST on Sunday, February
          4th. 
        </p>
        <p>
            After that no more coins will be minted.
        </p>
        <p>Enter your NYU address to claim your free coins.</p>
        <TextInput
          placeholder="Enter your NYU address..."
          type="email"
          value={freeCoinAddr}
          onChange={evt => this.setState({ freeCoinAddr: evt.target.value })}
        />
        <div>
          <button disabled={!this.props.isNetworkSupported} onClick={this.claimCoins.bind(this)}>
            Claim your free coins
          </button>
        </div>
        {didSubmitEmail && <p>Thanks! You'll receive an email shortly.</p>}
        </div>}
      </div>
    );
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
