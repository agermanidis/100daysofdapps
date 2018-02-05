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
import contractABI from "./abi";
import styled from 'styled-components';
import Hill from './hill.png';
import Rock from "./rock.png";

const GAS_LIMIT = 300000;

const Container = styled.div`
  margin: 3em;
`;

const QuoteAuthor = styled.div`
  margin-top: -2em;
  margin-bottom: 2em;
`;

const StyledInput = styled.input`
  border: none;
  border-bottom: 1px dashed black;
  outline: none;
  font-size: 1em;
  text-align: center;
  margin: auto 0.25em;
  padding: 0.3em;
  width: 100px;
`;

const SmallButton = styled.button`
  margin: 0 1em;
  font-size: 0.9em;
  padding: 0.5em;
`;

const CONTRACT_ADDRESSES = {
  ropsten: "0xa3f2d17e3aa8b8fdf03f1f1a295583982adbbce0"
};

class App extends SugarComponent {
  state = {
    rockPosition: 0,
    pushAmount: 0,
    pendingTx: null
  };

  async refreshDapp() {
    const { contractInstance } = this.state;
    const rockPosition = await contractInstance.methods.rockPosition().call();
    this.setState({rockPosition})
  }

  async componentDidMount() {
    const contractInstance = new this.props.web3.eth.Contract(
      contractABI,
      CONTRACT_ADDRESSES[this.props.network]
    );
    await this.setStateAsync({ contractInstance });
    await this.refreshDapp();
  }

  async pushRock () {
    const { web3 } = this.props;
    const { contractInstance, pushAmount } = this.state;
    contractInstance.methods
      .pushRock(pushAmount)
      .send({
        from: this.props.address,
        gas: GAS_LIMIT
      })
      .on("transactionHash", hash => {
        this.setState({ pendingTx: hash });
      });
  }

  render() {
    const { rockPosition, pushAmount, pendingTx } = this.state;

    return <Container>
        <h1>The Overflow of Sisyphus</h1>

        <blockquote>One must imagine Sisyphus happy.</blockquote>
        <QuoteAuthor>-- Albert Camus</QuoteAuthor>
        <p>
          The job of <EtherscanAddressLink network={this.props.network} address={CONTRACT_ADDRESSES[this.props.network]} text="this smart contract" /> is to push a rock up the hill.
        </p>
        <p>
          The rock's position is stored using a <code>uint8</code> (unsigned 8-bit integer) variable in that contract.
        </p>
        <p>
          Problem is that in Solidity, the programming language used to
          write this smart contract, integer operations can overflow.
        </p>
        <p>
          That means that, similarly to the Greek myth of <ExternalLink href="https://en.wikipedia.org/wiki/Sisyphus">
            Sisyphus
          </ExternalLink>, the rock's position restarts from zero after it reaches 255 (2<sup
          >
            8
          </sup> - 1) meters.
        </p>
        <div style={{ marginTop: "5em" }}>
          <img src={Hill} width={500} />
          <img width={50} style={{ position: "relative", top: -40 - rockPosition * 1.2, left: -500 + rockPosition * 1.75 }} src={Rock} />
        </div>
        <WithPendingTransaction web3={this.props.web3} transaction={pendingTx} onFinish={this.refreshDapp.bind(this)}>
          <p>
            Push by:
            <StyledInput min="0" step="1" type="number" value={pushAmount} onChange={evt => this.setState(
                  { pushAmount: evt.target.value }
                )} /> m <SmallButton onClick={this.pushRock.bind(this)} disabled={!this.props.isNetworkSupported}>
              Push
            </SmallButton>
          </p>
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
