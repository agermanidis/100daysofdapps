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
  ZERO_ADDRESS,
  uuid
} from "../common";
import styled from "styled-components";
import abi from './abi';
import { Route, IndexRoute } from "react-router";
import { HashRouter, Switch, Link } from "react-router-dom";
import VotingIcon from './voting.png';

const Container = styled.div`
  text-align: center;
  margin: 3em auto;
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
    ropsten: '0x0e48321fad343552608d45bda7a601f5c275110c'
};

class CreateProposal extends SugarComponent {
    state = {
        title: '',
        options: [],
        optionToAdd: ''
    };

    async componentDidMount () {
        const { web3 } = this.props;
        const contractInstance = new this.props.web3.eth.Contract(
            abi,
            CONTRACT_ADDRESSES[this.props.network]
          );
        await this.setStateAsync({ contractInstance });
        
    }

    async createPoll () {
        const { web3, address } = this.props;
        const { contractInstance, title, options } = this.state;
        const proposalId = uuid();
        this.setState({proposalId});
        const hash = await uploadStringToIpfs(JSON.stringify({
            title,
            options
        }));
        contractInstance
          .methods
          .createProposal(proposalId, hash, options.length)
          .send({ 
              from: this.props.address, 
              gas: GAS_LIMIT
          })
          .on("transactionHash", hash => {
            this.setState({ pendingTx: hash });
          })
    }

    render () {
        const { title, options, optionToAdd, pendingTx } = this.state;
        const { web3, network } = this.props;
        return <Container>
            <img src={VotingIcon} width={100} />
            <h1>Coinvote</h1>
            <p>Polls hosted in a smart contract.</p>
            <p>Vote weight is proportional to the voter's balance.</p>
            <p>
                <b>Question:</b>{' '}
                <StyledInput 
                    placeholder='To be or not to be?'
                    value={title} 
                    onChange={(evt) => this.setState({title: evt.target.value})}/>
            </p>
            <div>
                {
                    options.map((option, idx) => 
                        <p key={idx}>
                         {option}
                         <SmallButton onClick={() => {
                             let optionsCopy = JSON.parse(JSON.stringify(options));
                             optionsCopy.splice(idx, 1);
                             this.setState({options: optionsCopy});
                         }}>
                             -
                         </SmallButton>
                        </p>
                    )
                }
            </div>
            <p>
                <StyledInput 
                    placeholder='Type an option'
                    value={optionToAdd} 
                    onChange={(evt) => this.setState({optionToAdd: evt.target.value})}/>
                <SmallButton onClick={() => this.setState({
                    optionToAdd: '',
                    options: options.concat([optionToAdd])
                })}>
                    +
                </SmallButton>
            </p>
            <p>
                <WithPendingTransaction
                    transaction={pendingTx}
                    web3={web3}
                    network={network}
                    onFinish={() => {
                        window.location.hash = `/046_Coinvote/${this.state.proposalId}`;
                    }}>
                <button
                    onClick={this.createPoll.bind(this)}
                    disabled={!this.props.isNetworkSupported}>
                Create Poll
                </button>
                </WithPendingTransaction>
            </p>
            <p>
               <EtherscanAddressLink network={this.props.network} address={CONTRACT_ADDRESSES[this.props.network]} text="View contract on Etherscan" />
            </p>            
            </Container>;
    }
}

class ViewProposal extends SugarComponent {
    state = {
        proposalId: null,
        options: [],
        scores: [],
        hasVoted: false
    }

    async componentDidMount () {
        const proposalId = window.location.hash.split('/').slice(-1)[0];
        const { web3 } = this.props;
        const contractInstance = new this.props.web3.eth.Contract(
            abi,
            CONTRACT_ADDRESSES[this.props.network]
        );
        await this.setStateAsync({ contractInstance, proposalId });
        await this.refreshDapp();
    }

    async refreshDapp () {
        const { proposalId, contractInstance } = this.state;
        const { address } = this.props;
        const proposal = await contractInstance.methods.getProposal(proposalId).call();
        const contentHash = proposal[1];
        const { options, title } = JSON.parse(await ipfsCat(contentHash));
        this.setState({ options, title });
        const scores = await contractInstance.methods.getScores(proposalId).call();
        const hasVoted = await contractInstance.methods.hasVoted(proposalId, address).call();
        this.setState({ scores, hasVoted });
    }

    async vote (idx) {
        const { web3, address } = this.props;
        const { contractInstance, proposalId } = this.state;
        contractInstance
          .methods
          .vote(proposalId, idx)
          .send({ 
              from: this.props.address, 
              gas: GAS_LIMIT
          })
          .on("transactionHash", hash => {
            this.setState({ pendingTx: hash });
          })
    }

    render () { 
        const { title, options, scores, proposalId, hasVoted, pendingTx } = this.state;
        if (!scores.length) return <p>Loading...</p>
        console.log('scores', scores);
        return <Container>
            <img src={VotingIcon} width={100} />
            <h1>Coinvote</h1>
            <p>{title}</p>
            <div>
            <WithPendingTransaction
                transaction={pendingTx}
                web3={this.props.web3}
                network={this.props.network}
                onFinish={this.refreshDapp.bind(this)}>
                {
                    options.map((option, idx) => (
                        <p key={idx}>
                            {idx+1}. {option} (balance: {this.props.web3.utils.fromWei(scores[idx].toString())} ETH)
                            {!hasVoted && 
                                <SmallButton onClick={() => this.vote(idx)} disabled={!this.props.isNetworkSupported}>
                                Vote
                                </SmallButton>
                            }
                        </p>
                    ))
                }
                </WithPendingTransaction>
            </div>
            <p>
                <a href="#/046_Coinvote">Go Back</a>
            </p>
            <p>
               <EtherscanAddressLink network={this.props.network} address={CONTRACT_ADDRESSES[this.props.network]} text="View contract on Etherscan" />
            </p>
        </Container>;
    }
}


const Wrapped = () => (    
    <HashRouter>
      <Switch>
        <Route exact path="/046_Coinvote" component={() => (
          <EthereumWrapper mainNetwork="ropsten" supportedNetworks={["ropsten"]}>
            <CreateProposal />
          </EthereumWrapper>
        )} />
        <Route path="/046_Coinvote/:id" component={() => (
          <EthereumWrapper mainNetwork="ropsten" supportedNetworks={["ropsten"]}>
              <ViewProposal />
          </EthereumWrapper>
        )} />
      </Switch>
    </HashRouter>
);
export default Wrapped;