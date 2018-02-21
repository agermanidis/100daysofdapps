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
import ChatbotIcon from './chatbot.png';
import abi from './abi';
import update from 'immutability-helper';

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

const MessagesContainer = styled.div`
  min-height: 100px;
  width: 800px;
  margin: 1em auto;
  display: flex;
  text-align: left;
  justify-content: flex-end;
  flex-direction: column;
  text-align: left;
`;

const CONTRACT_ADDRESSES = {
  ropsten: '0xdec253ec598145c5c1d3e69555aa690c00767375'
};

const GAS_LIMIT = 300000;

class App extends SugarComponent {
  state = {
    newRuleQuestion: '',
    newRuleAnswer: '',
    textInput: '',
    rules: [],
    messages: []
  }

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
    const numberOfRules = await contractInstance.methods.numberOfRules().call();
    let rules = [];
    for (var i = 0; i < numberOfRules; i++) {
      const result = await contractInstance.methods.rules(i).call();
      rules.push({
        id: i,
        question: result[0],
        answer: result[1]
      });
    }
    console.log('rules', rules);
    this.setState({rules});
  }

  async addRule () {
    const { newRuleAnswer, newRuleQuestion, contractInstance } = this.state;
    contractInstance
      .methods
      .addRule(newRuleQuestion, newRuleAnswer)
      .send({ 
          from: this.props.address, 
          gas: GAS_LIMIT
      })
      .on("transactionHash", hash => {
        this.setState({ pendingTx: hash });
      })
  }

  async sendMessage () {
    const { textInput, rules } = this.state;

    let response = {from: 'Bot'};

    for (var i = 0; i < rules.length; i++) {
      if (textInput.indexOf(rules[i].question) !== -1) {
        response.content = rules[i].answer;
      }
    }

    if (!response.content) response.content = "I'm afraid I don't know how to answer that";

    this.setState(update(this.state, {
      messages: {$push: [{from: 'You', content: textInput}, response]},
      textInput: {$set: ''}
    }));
  }

  render () {
    const { newRuleAnswer, newRuleQuestion, rules, messages, textInput } = this.state;
    
    return <Container>
      <img src={ChatbotIcon} width={100} />
      <h1>Decentralized Chatbot</h1>
      <p>A basic request-response chatbot whose rules are stored on the blockchain.</p>
      <h3>Rules:</h3>
      {rules.map(({id, question, answer}, idx)=> {
        return <p key={idx}>
          "{question}" -> "{answer}"
          </p>;
      })}
      <h3>Add a rule:</h3>
      <div>
        <div>
          When the user says:
          <StyledInput placeholder='Type a question' value={newRuleQuestion} onChange={(evt) => this.setState({newRuleQuestion: evt.target.value})} />
        </div>
        <div>
          Respond with:
        <StyledInput placeholder='Type a response' value={newRuleAnswer} onChange={(evt) => this.setState({newRuleAnswer: evt.target.value})} />
        </div>
        <p>
          <WithPendingTransaction 
            transaction={this.state.pendingTx}
            web3={this.props.web3}
            network={this.props.web3}
            onFinish={this.refreshDapp.bind(this)} >
          <SmallButton onClick={this.addRule.bind(this)} disabled={!this.props.isNetworkSupported || !newRuleQuestion || !newRuleAnswer}>
            Add Rule
          </SmallButton>
          </WithPendingTransaction>
        </p>
      </div>
      <h3>Try out the chatbot:</h3>
      <MessagesContainer>
        {messages.map(({content, from}, idx) => {
          return <div key={idx}>
              <b>{from}:</b> {content}
            </div>;
        })}
      </MessagesContainer>
      <StyledInput 
                onKeyPress={(evt) => {
                    if (evt.key === 'Enter') this.sendMessage();
                }}
                placeholder="Type a message" value={textInput} onChange={evt => this.setState(
                  { textInput: evt.target.value }
                )} />

            <SmallButton onClick={this.sendMessage.bind(this)}>
              Send
            </SmallButton>

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
  