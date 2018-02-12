//0x69c1a73d2b1661ec8858e485506f2081d877b0c6

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
import contractABI from './abi';
import styled from 'styled-components';
import moment from 'moment';

const GAS_LIMIT = 300000;

const CONTRACT_ADDRESSES = {
    ropsten: "0x82c2193cc1ef99f6bff12c5815bdf367893c95c3"
};


const Container = styled.div`
  text-align: center;
  margin: 3em 0;
`;

const SmallButton = styled.button`
  margin: 0 1em;
  font-size: 0.9em;
  padding: 0.5em;
`;

class App extends SugarComponent {
    state = {
        name: '',
        signatories: [],
        signed: false,
        pendingTx: null
    }

    async refreshDapp () {
        const { contractInstance } = this.state;
        const { address } = this.props;
        const numberOfSignatories = await contractInstance.methods.numberOfSignatories().call();
        let signatories = [];
        for (var i = 0; i < numberOfSignatories; i++) {
            const result = await contractInstance.methods.signatories(i).call();
            signatories.push({
                id: i,
                address: result[0],
                name: result[1],
                time: result[2]
            })
        }
        const signed = await contractInstance.methods.hasSigned(address).call();
        this.setState({ signatories, signed });
    }

    async componentDidMount () {
        const contractInstance = new this.props.web3.eth.Contract(
          contractABI,
          CONTRACT_ADDRESSES[this.props.network]
        );
        await this.setStateAsync({ contractInstance });
        await this.refreshDapp();
    }

    async sign () {
        const { contractInstance, name } = this.state;
        const { address } = this.props;
        contractInstance.methods
            .iWillMakeGoodArt(name)
            .send({ 
                from: address, 
                gas: GAS_LIMIT 
            })
            .on("transactionHash", hash => {
                this.setState({ pendingTx: hash });
            });
    }

    render () {
        const { name, signatories, signed, pendingTx } = this.state;

        return <Container>

            <h1>Make Good Art</h1>
            <p>By signing this immutable contract, you promise to always make good art.</p>
            <WithPendingTransaction
                    web3={this.props.web3}
                    network={this.props.network}
                    transaction={pendingTx}
                    onFinish={this.refreshDapp.bind(this)}>
            {!signed && <div>
                <input placeholder='Your name (keep blank for anonymous)' value={name} onChange={(evt) => this.setState({name: evt.target.value})} />
                <SmallButton disabled={!this.props.isNetworkSupported} onClick={this.sign.bind(this)}>
                    Sign
                </SmallButton>
            </div>} 
            </WithPendingTransaction>
            {!!signatories.length && <h3>Current Signatures</h3>}
            {signatories.map((s, idx) => {
                return <div style={{margin: '2em'}}>
                    <EtherscanAddressLink address={s.address} network={this.props.network} text={s.name || 'Anonymous'} />
                    {' '}{moment(parseInt(s.time)*1000).fromNow()}
                </div>;
            })}
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
  