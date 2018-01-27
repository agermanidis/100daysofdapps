

import React, { Component } from 'react'
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
    NewPostInput,
    isValidEthAddress,
    ZERO_ADDRESS
  } from "../common";
import { TextInput } from '../styles';
import { Provider } from 'react-redux';
import styled from 'styled-components';
import MdCancel from 'react-icons/lib/md/cancel';
import configureStore from './configureStore';
import contractABI from './abi';
import './index.css';

import App from './containers/App';
import { updateEthInfo, updateContract } from './actions';

const CONTRACT_ADDRESSES = {
    ropsten: "0xabab75c993f8461b0ff65b633dc7625901e9cbd8"
};

const store = configureStore();

class Root extends SugarComponent {
  componentDidMount () {
    const { web3, network, address, isNetworkSupported } = this.props;
    store.dispatch(updateEthInfo({ web3, network, address, isNetworkSupported }));

    const contractInstance = new web3.eth.Contract(contractABI, CONTRACT_ADDRESSES[network]);
    store.dispatch(updateContract(contractInstance));
  }

  componentWillReceiveProps (props) {
    const { web3, network, address, isNetworkSupported } = props;
    store.dispatch(updateEthInfo({ web3, network, address, isNetworkSupported }));
  }

  render() {
      return (
          <Provider store={store}>
            <App/>
          </Provider>
      );
    }
}

const Wrapped = () => (
    <EthereumWrapper
      mainNetwork="ropsten"
      supportedNetworks={Object.keys(CONTRACT_ADDRESSES)}
    >
      <Root />
    </EthereumWrapper>
  );
export default Wrapped;  