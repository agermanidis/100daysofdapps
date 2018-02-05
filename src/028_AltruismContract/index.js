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
import styled from "styled-components";
import MdSend from "react-icons/lib/md/send";
import contractABI from "./abi";
import AltruismIcon from './altruism.jpg';
import FaSitemap from "react-icons/lib/fa/sitemap";

const Container = styled.div`
  text-align: center;
  margin: 3em 0;
`;

const GAS_LIMIT = 300000;

const CONTRACT_ADDRESSES = {
  ropsten: "0x408c970c8e0cd3b692d24b42143673baa32ab888"
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
  text-align: right;
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
      isSubscribed: false,
      amount: 0,
      pendingTx: null
  };

  async refreshDapp() {
    const { contractInstance } = this.state;
    const { address } = this.props;
    const isSubscribed = await contractInstance.methods.isRecipient(address).call();    
    this.setState({ isSubscribed });
  }

  async componentDidMount() {
    const contractInstance = new this.props.web3.eth.Contract(
      contractABI,
      CONTRACT_ADDRESSES[this.props.network]
    );
    await this.setStateAsync({ contractInstance });
    await this.refreshDapp();
  }

  async subscribe () {
    const { web3 } = this.props;
    const { contractInstance } = this.state;
    contractInstance.methods
      .register()
      .send({
        from: this.props.address,
        gas: GAS_LIMIT
      })
      .on("transactionHash", hash => {
        this.setState({ pendingTx: hash });
      });
  }

  async deposit() {
    const { web3 } = this.props;
    const { contractInstance, amount } = this.state;
    contractInstance.methods
      .deposit()
      .send({
        value: web3.utils.toWei(amount.toString()),
        from: this.props.address,
        gas: GAS_LIMIT
      })
      .on("transactionHash", hash => {
        this.setState({ pendingTx: hash });
      });
  }

  render() {
    const { web3 } = this.props;
    const {
        isSubscribed,
        amount,
        pendingTx
    } = this.state;
    return <Container>
        <img src={AltruismIcon} width={100} />
        <h2>Altruism Contract</h2>
        <p>A contract for redistributing ether.</p>
        <p>
          Everyone who subscribes gets an equal share of all ether sent to
          the contract.
        </p>
        <WithPendingTransaction 
            web3={this.props.web3} 
            transaction={pendingTx} 
            onFinish={() => {this.setState({amount: 0}); this.refreshDapp.bind(this)}}>
          <p>
            <NumberInput step="0.1" value={amount} onChange={evt => this.setState(
                  { amount: evt.target.value }
                )} /> ether <SmallButton onClick={this.deposit.bind(this)} disabled={!this.props.isNetworkSupported}>
              <FaSitemap /> Redistribute
            </SmallButton>
          </p>
          {isSubscribed ? <p>
              You are subscribed to the contract.
            </p> : <button onClick={this.subscribe.bind(this)} disabled={!this.props.isNetworkSupported}>
              Subscribe to contract
            </button>}
        </WithPendingTransaction>
        <p>
          <EtherscanAddressLink network={this.props.network} address={CONTRACT_ADDRESSES[this.props.network]} text="View contract on Etherscan" />
        </p>
      </Container>;
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
