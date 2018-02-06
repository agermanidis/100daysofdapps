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
import styled from "styled-components";
import NeighborsIcon from './neighbors.png';
import ReactLoading from "react-loading";
import FaSearch from 'react-icons/lib/fa/search';

const Container = styled.div`
  text-align: center;
  margin: 3em 0;
`;

class App extends SugarComponent {
  state = {
      searching: false,
      neighbor: null,
      current: ''
  };

  async search () {
    this.setState({searching: true});
    const { web3 } = this.props;
    let addresses = [];
    const blockN = (await this.props.web3.eth.getBlock('latest')).number;
    for (var i = blockN-100; i < blockN; i++) {
        const block = await this.props.web3.eth.getBlock(i);
        const transactions = block.transactions;
        for (var j = 0; j < transactions.length; j++) {
            const tx = await this.props.web3.eth.getTransaction(transactions[j]);
            addresses.push(tx.from);
            addresses.push(tx.to);
        }
        this.setState({current: addresses[addresses.length-1]})
    }

    let bestScore = 1e+49;
    let closest = null;
    const mine = new web3.utils.BN(this.props.address);
    for (var i = 0; i < addresses.length; i++) {
        const other = new web3.utils.BN(addresses[i]);
        const diff = mine.sub(other).abs();
        if (diff < bestScore) {
            bestScore = diff;
            closest = addresses[i];
        }
    }
    this.setState({searching: false, neighbor: closest});
  }

  render() {
    const { web3 } = this.props;
    const {
        searching,
        neighbor,
        current
    } = this.state;
    return <Container>
        <img src={NeighborsIcon} width={150} />
        <h1>Your Blockchain Neighbor</h1>
        <p>Find the active account (i.e. has done at least 1 transaction) with the hash that's closest to yours in the Ethereum blockchain.</p>
        {!neighbor && !searching && <button onClick={this.search.bind(this)} disabled={!this.props.isNetworkSupported}>
            <FaSearch/> Find your neighbor
        </button>}
        {searching && <div style={{color: 'gray'}}>
            <p>Searching...</p>
            <p>{current}</p>
        </div>}
        {neighbor && <p>Your neighbor is <EtherscanAddressLink network={this.props.network} address={neighbor} />!</p>}
      </Container>;
  }
}

const Wrapped = () => (
  <EthereumWrapper
    mainNetwork="ropsten"
    supportedNetworks={['mainnet','ropsten']}
  >
    <App />
  </EthereumWrapper>
);
export default Wrapped;
