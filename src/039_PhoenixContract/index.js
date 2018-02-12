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
import phoenixABI from './phoenixABI';
import trackerABI from './trackerABI';
import PhoenixIcon from './phoenix.png';
import styled from 'styled-components';

const GAS_LIMIT = 300000;

const CONTRACT_ADDRESSES = {
    ropsten: "0x0fdcdd0e97a80fdb673c7afef984a0ecc3aa7f5b"
};

const Container = styled.div`
  text-align: center;
  margin: 3em 0;
`;


class App extends SugarComponent {
    state = {
        currentAddress: '',
        pendingTx: null
    }

    async refreshDapp () {
        const { contractInstance } = this.state;
        const currentAddress = await contractInstance.methods.current().call();
        this.setState({currentAddress});
    }

    async componentDidMount () {
        const contractInstance = new this.props.web3.eth.Contract(
          trackerABI,
          CONTRACT_ADDRESSES[this.props.network]
        );
        await this.setStateAsync({ contractInstance });
        await this.refreshDapp();
    }

    async regenerate () {
        const { currentAddress } = this.state;
        const contractInstance = new this.props.web3.eth.Contract(
            phoenixABI,
            currentAddress
          );          
        const { address } = this.props;
        contractInstance.methods
            .regenerate()
            .send({ 
                from: address, 
                gas: GAS_LIMIT 
            })
            .on("transactionHash", hash => {
                this.setState({ pendingTx: hash });
            });
        
    }

    render () {
        return <Container>
            <img src={PhoenixIcon} width={150} />
            <h1>Phoenix Contract</h1>
            <p>A smart contract that creates a new instance of itself every time it is destroyed.</p>
            <p>Current phoenix address:{' '}
            <EtherscanAddressLink address={this.state.currentAddress} network={this.props.network} /></p>
            <WithPendingTransaction
                    web3={this.props.web3}
                    network={this.props.network}
                    transaction={this.state.pendingTx}
                    onFinish={this.refreshDapp.bind(this)}>
                <button disabled={!this.props.isNetworkSupported} onClick={this.regenerate.bind(this)}>
                    Destroy Phoenix
                </button>
            </WithPendingTransaction>
        </Container>;
    }
}

const Wrapped = () => (
    <EthereumWrapper
      mainNetwork="ropsten"
      supportedNetworks={['ropsten']}
    >
    <App/>
    </EthereumWrapper>
  );
  export default Wrapped;
  