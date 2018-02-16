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
  uploadFileToIpfs,
  ipfsCat,
  ipfsURL,
  isValidEthAddress,
  ZERO_ADDRESS
} from "../common";
import abi from './abi';
import styled from 'styled-components';
import HashIcon from './hash.png';

const Container = styled.div`
  text-align: center;
  margin: 3em 0;
`;

const StyledInput = styled.input`
  border: none;
  border-bottom: 1px dashed gray;
  outline: none;
  font-size: 1em;
  text-align: center;
  margin: auto 0.25em;
  padding: 0.3em;
`;

const SmallButton = styled.button`
  margin: 0 1em;
  font-size: 0.9em;
  padding: 0.5em;
`;

const GAS_LIMIT = 300000;

const CONTRACT_ADDRESSES = {
    ropsten: '0xb0911671c1100da385e5344a8f01886a866b2206'
}

class App extends SugarComponent {
    state = {
        links: [],
        shareHash: '',
        shareName: ''
    };

    async componentDidMount () {
        const { web3 } = this.props;
        const contractInstance = new this.props.web3.eth.Contract(
            abi,
            CONTRACT_ADDRESSES[this.props.network]
          );
        await this.setStateAsync({ contractInstance });
        await this.refreshDapp();
    }

    async refreshDapp () {
        const { contractInstance } = this.state;
        let links = [];
        const numberOfLinks = await contractInstance.methods.numberOfItems().call();
        for (var i = 0; i < numberOfLinks; i++) {
            const result = await contractInstance.methods.items(i).call();
            links.push({
                id: i,
                hash: result[0],
                name: result[1]
            });
        }
        this.setState({ links });
    }

    async add () {
        const { web3, address } = this.props;
        const { contractInstance, shareHash, shareName } = this.state;
        contractInstance
          .methods
          .add(shareHash, shareName)
          .send({ 
              from: this.props.address, 
              gas: GAS_LIMIT
          })
          .on("transactionHash", hash => {
            this.setState({ pendingTx: hash });
          })
    }

    render () {
      const { web3, network } = this.props;
      const { shareHash, shareName, links, pendingTx } = this.state;
      return <Container>
            <img src={HashIcon} width={100} />
            <h2>Cool Hashes</h2>
            <p>A listing of interesting IPFS hashes, stored on the blockchain</p>
            <WithPendingTransaction
                transaction={pendingTx}
                network={network}
                web3={web3}
                onFinish={this.refreshDapp.bind(this)}>
            <p>
                <StyledInput placeholder='Name' value={shareName} onChange={(evt) => this.setState({shareName: evt.target.value}) }/>
                <StyledInput placeholder='Hash' value={shareHash} onChange={(evt) => this.setState({shareHash: evt.target.value}) }/>
                <SmallButton onClick={this.add.bind(this)}>
                    Add
                </SmallButton>
            </p>
            </WithPendingTransaction>
            <div>
            <br/>
            {links.map(({hash, name}) => (
                <p><ExternalLink href={ipfsURL(hash)}>{name}</ExternalLink></p>
            ))}
            </div>      
        </Container>;
    }
}

const Wrapped = () => (
    <EthereumWrapper
      mainNetwork="ropsten"
      supportedNetworks={Object.keys(CONTRACT_ADDRESSES)}
    >
    <App/>
    </EthereumWrapper>
  );
  export default Wrapped;
  