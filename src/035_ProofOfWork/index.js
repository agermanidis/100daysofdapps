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
import styled from 'styled-components';
import MiningIcon from './mining.png';
import contractABI from './abi';
import { sha256 } from 'js-sha256';

const GAS_LIMIT = 5000000;

const CONTRACT_ADDRESSES = {
  ropsten: "0x16b994ca0ea5e2599c8db1958866a626722a6bed"
};

const Container = styled.div`
  text-align: center;
  margin: 3em 0;
`;


class App extends SugarComponent {
    state = {
        sentence: '',
        difficulty: 0,
        goodNonce: 0,
        succeeded: false,
        mining: false,
        winner: ZERO_ADDRESS
    };

    async componentDidMount() {
        const contractInstance = new this.props.web3.eth.Contract(
          contractABI,
          CONTRACT_ADDRESSES[this.props.network]
        );
        await this.setStateAsync({ contractInstance });
        await this.refreshDapp();
    }

    async refreshDapp () {
        const { contractInstance } = this.state;
        const { address } = this.props;
        const sentence = await contractInstance.methods.sentence().call();
        const difficulty = await contractInstance.methods.difficulty().call();
        const winner = await contractInstance.methods.currentWinner().call();
        console.log({sentence, difficulty, winner});
        this.setState({ sentence, difficulty, winner });
    }

    async mine () {
        const { sentence, difficulty } = this.state;
        this.setState({mining: true});
        let nonce = 0;
        while (true) {
            const hash = sha256(sentence + nonce.toString());
            let success = true;
            for (var i = 0; i < difficulty; i++) {
                if (hash[i*2] != '0' || hash[i*2+1] != '0') {
                    success = false;
                    break;
                }
            }
            if (success) {
                break;
            }
            nonce += 1;
        }
        this.setState({mining: false, succeeded: true, goodNonce: nonce});
    }

    async submitNonce () {
        const { contractInstance, goodNonce } = this.state;
        const { address } = this.props;
        contractInstance.methods
            .submitWork(goodNonce.toString())
            .send({ 
                from: address, 
                gas: GAS_LIMIT 
            })
            .on("transactionHash", hash => {
                this.setState({ pendingTx: hash });
            });
    }

    render () {
        const { web3, address } = this.props;
        const { sentence, difficulty, winner, succeeded, goodNonce, mining } = this.state;
        return <Container>
                <img src={MiningIcon} width={100}/>
                <h1>Proof-of-work Game</h1>
                <p>Mine the correct nonce to solve the current proof-of-work challenge.</p>
                <p>When you win, you can set the next challenge and difficulty.</p>
                <br/>
                <div>
                    <p><b>Challenge:</b> {sentence}</p>
                    <p><b>Difficulty:</b> {difficulty}</p>
                </div>
                <br/>
                <div>
                <button 
                    disabled={!this.props.isNetworkSupported} 
                    onClick={this.mine.bind(this)}>Mine (Find Nonce)</button> 
                </div>
                {mining && <p>Mining...</p>}
                {succeeded && <div>
                    <p>Found successful nonce: {goodNonce}</p>
                    <WithPendingTransaction 
                        web3={this.props.web3}
                        network={this.props.network}
                        transaction={this.state.pendingTx}
                        onFinish={() => {
                            this.refreshDapp();
                        }}>
                    <button 
                        disabled={!this.props.isNetworkSupported} 
                        onClick={this.submitNonce.bind(this)}>Submit Nonce</button> 
                    </WithPendingTransaction>
                </div>}
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
    <App/>
    </EthereumWrapper>
  );
  export default Wrapped;
  