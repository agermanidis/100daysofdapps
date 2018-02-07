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
import styled from 'styled-components';
import contractABI from './abi';
import FaCheck from 'react-icons/lib/fa/check';
import FaClose from 'react-icons/lib/fa/close';
import FaPlus from 'react-icons/lib/fa/plus';
import ReactModal from "react-modal";
import Textarea from "react-expanding-textarea";
import moment from 'moment';

const GAS_LIMIT = 300000;

const ANGER_COIN = {
    ropsten: "0x1142125c9ae681492e851fc77afd1e7e14157e14"
};

const FEAR_COIN = {
    ropsten: '0x3c4365905f2276ef898b2e967ecc5a0a43c5a8b4'
};

const DISGUST_COIN = {
    ropsten: '0xc0b152dbc0e8b6f3fcb8d2f6987b89f3e298a0e3'
};

const SURPRISE_COIN = {
    ropsten: '0x73a93a32f7ab719ec08ce6a49388e87d1f3d23b6'
};

const HAPPINESS_COIN = {
    ropsten: '0x26c4ec14f314b536b0efce35c98786fb8eae4940'
};

const SADNESS_COIN = {
    ropsten: '0x8211941e94b1d68607dea21f919e962090877599'
};

const Container = styled.div`
  text-align: center;
  margin: 3em 0;
`;

const EmotionsContainer = styled.div`
    display: flex;
    justify-content: center;
    width: 75%;
    margin: 2em auto;
    & > div {
        flex: 1;
    }
`;

const BigEmoji = styled.div`
    font-size: 50px;
`;

const SmallButton = styled.button`
  margin: 0 1em;
  font-size: 0.9em;
  padding: 0.5em;
`;

class App extends SugarComponent {
    state = {
        angerBalance: 0,
        fearBalance: 0,
        disgustBalance: 0,
        happinessBalance: 0,
        sadnessBalance: 0,
        surpriseBalance: 0,
        pendingTx: null
    };

    emotionsInfo = [
        {
            name: 'Anger',
            emoji: '😡',
            contractKey: 'angerInstance',
            balanceKey: 'angerBalance'
        },
        {
            name: 'Fear',
            emoji: '😨',
            contractKey: 'fearInstance',
            balanceKey: 'fearBalance'
        },
        {
            name: 'Disgust',
            emoji: '🤢',
            contractKey: 'disgustInstance',
            balanceKey: 'disgustBalance'
        },
        {
            name: 'Happiness',
            emoji: '😊',
            contractKey: 'happinessInstance',
            balanceKey: 'happinessBalance'
        },
        {
            name: 'Sadness',
            emoji: '😢',
            contractKey: 'sadnessInstance',
            balanceKey: 'sadnessBalance'
        },
        {
            name: 'Surprise',
            emoji: '😮',
            contractKey: 'surpriseInstance',
            balanceKey: 'surpriseBalance'
        }
    ];

    async componentDidMount() {
        const angerInstance = new this.props.web3.eth.Contract(
            contractABI,
            ANGER_COIN[this.props.network]
        );
        const fearInstance = new this.props.web3.eth.Contract(
            contractABI,
            FEAR_COIN[this.props.network]
        );
        const disgustInstance = new this.props.web3.eth.Contract(
            contractABI,
            DISGUST_COIN[this.props.network]
        );
        const happinessInstance = new this.props.web3.eth.Contract(
            contractABI,
            HAPPINESS_COIN[this.props.network]
        );
        const sadnessInstance = new this.props.web3.eth.Contract(
            contractABI,
            SADNESS_COIN[this.props.network]
        );
        const surpriseInstance = new this.props.web3.eth.Contract(
            contractABI,
            SURPRISE_COIN[this.props.network]
        );
        await this.setStateAsync({ 
            angerInstance,
            fearInstance,
            disgustInstance,
            happinessInstance,
            sadnessInstance,
            surpriseInstance
        });
        await this.refreshDapp();
      }

    async refreshDapp () {
        const { 
            angerInstance,
            fearInstance,
            disgustInstance,
            happinessInstance,
            sadnessInstance,
            surpriseInstance
        } = this.state;
        const { address } = this.props;
        const angerBalance = await angerInstance.methods.balanceOf(address).call();
        const fearBalance = await fearInstance.methods.balanceOf(address).call();
        const disgustBalance = await disgustInstance.methods.balanceOf(address).call();
        const happinessBalance = await happinessInstance.methods.balanceOf(address).call();
        const sadnessBalance = await sadnessInstance.methods.balanceOf(address).call();
        const surpriseBalance = await surpriseInstance.methods.balanceOf(address).call();
        this.setState({
            angerBalance,
            fearBalance,
            disgustBalance,
            happinessBalance,
            sadnessBalance,
            surpriseBalance         
        });
    }

    async mint (contractKey) {
        const contract = this.state[contractKey];
        const { address } = this.props;
        contract.methods
            .mintOne()
            .send({ 
                from: address, 
                gas: GAS_LIMIT 
            })
            .on("transactionHash", hash => {
                this.setState({ pendingTx: hash });
            });
    }

    render () {
        const { web3, network } = this.props;
        return <Container>
            <h1>Emotion Coins</h1>
            <p>A crypto-token for each of the basic emotions.</p>
            <p>Every time you feel an emotion, mint the corresponding coin.</p>
            <EmotionsContainer>
            {
                this.emotionsInfo.map((emotion, idx)=> {
                  return <div>
                      <BigEmoji>{emotion.emoji}</BigEmoji>
                      <h3>{emotion.name}</h3>
                      <h3>Balance: {web3.utils.fromWei(this.state[emotion.balanceKey].toString())}</h3>
                      <WithPendingTransaction
                        pendingMsg=''
                        successMsg=''
                        web3={web3}
                        network={network}
                        transaction={this.state.pendingTx}
                        onFinish={this.refreshDapp.bind(this)}>
                      <SmallButton 
                        disabled={!this.props.isNetworkSupported} 
                        onClick={() => this.mint(emotion.contractKey)}>
                        Mint
                      </SmallButton> 
                      </WithPendingTransaction>
                      </div>;
                })
            }
            </EmotionsContainer>
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
  