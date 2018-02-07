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
import TargetIcon from './target.png';
import styled from 'styled-components';
import contractABI from './abi';
import FaCheck from 'react-icons/lib/fa/check';
import FaClose from 'react-icons/lib/fa/close';
import FaPlus from 'react-icons/lib/fa/plus';
import ReactModal from "react-modal";
import Textarea from "react-expanding-textarea";
import moment from 'moment';

const GAS_LIMIT = 300000;

const CONTRACT_ADDRESSES = {
  ropsten: "0xf62d9f7c23592f7c4cd09c80ff2cb1b1a02948d4"
};

const Container = styled.div`
  text-align: center;
  margin: 3em 0;
`;

const Goal = styled.div`
    display: flex;
    flex-direction: column;
    margin: 2em auto;
    text-align: center;
    border: 1px solid lightgray;
    border-radius: 5px;
    padding: 1em;
    width: 400px;
`;

const StyledInput = styled.input`
  outline: none;
  font-size: 1em;
  text-align: left;
  margin: auto 0.25em;
  padding: 0.3em;
  width: 50%;
  text-align: center;
`;


const StyledTextarea = styled(Textarea)`
  outline: none;
  height: 50px;
  resize: none;
  min-height: 200px;
  margin: 0;
  padding: 10px;
`;

const SmallButton = styled.button`
  margin: 0 1em;
  font-size: 0.9em;
  padding: 0.5em;
`;

const AddressInput = styled(StyledInput)`
  width: 400px;
`;

const StyledNumberInput = styled(StyledInput)`
  width: 100px;
`;

const NumberInput = props => {
  return <StyledNumberInput min="0" step="0.1" type="number" {...props} />;
};


const customModalStyle = {
    content: {
      top: "50%",
      left: "50%",
      width: '500px',
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)"
    }
  };
  


class App extends SugarComponent {
    state = {
        showCreate: false,
        createDescription: '',
        createVerifier: '',
        createDeposit: 0,
        goals: []
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
        const numberOfGoals = await contractInstance.methods.numberOfGoals().call();
        let goals = [];
        for (var i = 0; i < numberOfGoals; i++) {
            const result = await contractInstance.methods.goals(i).call();
            const content = await ipfsCat(result[0]);
            const submitter = result[1];
            const verifier = result[2];
            const bounty = result[2];
            const verified = result[4];
            goals.push({id: i, content, submitter, verifier, bounty, verified});
        }
        this.setState({ goals });
    }

    async createGoal () {
        const { contractInstance, createDescription, createVerifier, createDeposit } = this.state;
        const { address } = this.props;
    
        const hash = await uploadStringToIpfs(createDescription);
    
        contractInstance.methods
            .setGoal(createVerifier, hash)
            .send({ 
                value: this.props.web3.utils.toWei(createDeposit.toString()),
                from: address, 
                gas: GAS_LIMIT 
            })
            .on("transactionHash", hash => {
                this.setState({ pendingTx: hash });
            });
    }

    async verify (goalId) {
        const { contractInstance } = this.state;
        const { address } = this.props;
        contractInstance.methods
            .verifyGoal(goalId)
            .send({ 
                from: address, 
                gas: GAS_LIMIT 
            })
            .on("transactionHash", hash => {
                this.setState({ pendingTx: hash });
            });

    }
    
    render () {
        const { goals, showCreate, createDescription, createVerifier, createDeposit } = this.state;
        return <Container>
                <ReactModal 
                  shouldCloseOnOverlayClick={true} 
                  style={customModalStyle} 
                  onRequestClose={() => this.setState(
                    { showCreate: false}
                  )} 
                  isOpen={showCreate}>
                <h2><center>Create Goal</center></h2>
                <p><b>Goal Verifier:</b></p>
                <p><AddressInput
                    placeholder='Verifier address'
                    value={createVerifier} 
                    onChange={(evt) => this.setState({createVerifier: evt.target.value})}/></p>
                <p><b>Goal Description:</b></p>
                <p><StyledTextarea 
                    placeholder='Describe your goal'
                    value={createDescription} 
                    onChange={(evt) => this.setState({createDescription: evt.target.value})}/></p>
                <p><b>Goal Deposit:</b></p>
                <p><NumberInput
                    value={createDeposit}
                    onChange={(evt) => this.setState({createDeposit: evt.target.value})}/></p>
                <WithPendingTransaction 
                    web3={this.props.web3}
                    transaction={this.state.pendingTx}
                    onFinish={() => {
                        this.setState({
                            createDescription: '',
                            createVerifier: '',
                            showCreate: false
                        });
                        this.refreshDapp();
                    }}>
                <SmallButton onClick={this.createGoal.bind(this)} disabled={!this.props.isNetworkSupported}>
                    Create
                </SmallButton>
                <SmallButton onClick={() => this.setState({ showCreate: false })}>
                    Close
                </SmallButton>
                </WithPendingTransaction>`
                </ReactModal>

                <img src={TargetIcon} width={100} />
                <h1>Goal Tracker</h1>
                <p>Track goals on the blockchain.</p>
                <p>Attach a deposit to goals to incentivize yourself to finish them.</p>
                <p>You can select the address that would verify the goal was completed.</p>
                {goals.map((goal, idx) => {
                    return (
                        <Goal key={goal.id}>
                            <p><b>Goal</b>: {goal.content}</p>
                            <span><b>Submitter</b>: <EtherscanAddressLink address={goal.submitter} network={this.props.network} /></span>
                            <span><b>Verifier</b>: <EtherscanAddressLink address={goal.verifier} network={this.props.network} /></span>
                            {goal.verified ?
                            <p><FaCheck style={{color: 'green'}}/> Goal successful</p> :
                            <p style={{color: 'gray'}}>Goal pending</p>}
                            {!goal.verified && goal.verifier === this.props.address && 
                            <WithPendingTransaction 
                                web3={this.props.web3}
                                transaction={this.state.pendingTx}
                                onFinish={this.refreshDapp.bind(this)}>
                                <button onClick={() => this.verify(goal.id)}>
                                Verify
                                </button>
                            </WithPendingTransaction>}
                        </Goal>
                    );
                })}
                <div>
                <button onClick={() => this.setState({showCreate: true})} disabled={!this.props.isNetworkSupported}>
                    <FaPlus /> Create Goal
                </button>
                </div>
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
  