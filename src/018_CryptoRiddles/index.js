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
  ipfsURL
} from "../common";
import contractABI from "./abi";
import "./index.css";
import RiddleIcon from './RiddleIcon.png';
import { setInterval } from "timers";
import { sha256 } from "js-sha256";
import update from "immutability-helper";

const CONTRACT_ADDRESSES = {
  ropsten: "0x7bba26a3febe244b4cb4fb141a615bddb6c7e687"
};

const GAS_LIMIT = 300000;

class Riddle extends Component {
    constructor () {
        super();
        this.state = {
            answerInput: ''
        };
    }

    render () {
        const {
            riddle, 
            submitter, 
            winner, 
            answer, 
            prize, 
            onAnswer, 
            onFinish,
            web3, 
            isNetworkSupported,
            pendingTx} = this.props;
        const {answerInput} = this.state;
        return <div className="riddle">
            <div>
              <b>Q:</b> {riddle}
            </div>
            <div>
              <b>A: </b>
              {answer ? <span>
                    {answer}
                
                </span> : <input onChange={evt => this.setState({
                      answerInput: evt.target.value
                    })} placeholder="Answer the riddle..." value={answerInput} />}
            </div>
            {answer && <div>Answered by <EtherscanAddressLink address={winner}/></div>}
            {!answer && 
            <WithPendingTransaction 
                pendingMsg='' 
                transaction={pendingTx} 
                web3={web3}
                onFinish={onFinish}>
                <button 
                    disabled={!isNetworkSupported} 
                    className="answer" 
                    onClick={() => onAnswer(answerInput)}>
                  Answer for {prize} ETH
                </button>
              </WithPendingTransaction>}
          </div>;
    }
}

class App extends SugarComponent {
  constructor() {
    super();
    this.state = {
      newRiddleA: "",
      newRiddleQ: "",
      prize: 0,
      pendingCreateTx: null,
      pendingAnswerTxs: {},
      riddles: []
    };
  }

  async refreshDapp() {
    const { web3, address } = this.props;
    const { contractInstance } = this.state;

    const numberOfRiddles = await contractInstance.methods.numberOfRiddles().call();

    let riddles = [];
    for (var i = 0 ; i < numberOfRiddles; i++) {
        const riddle = await contractInstance.methods
          .riddles(i.toString())
          .call();
        riddles.push({
            id: i,
            submitter: riddle[0],
            riddle: riddle[1],
            answer: riddle[3],
            prize: web3.utils.fromWei(riddle[4]),
            winner: riddle[5]
        })
    }
    this.setState({riddles});
  }

  async componentDidMount() {
    const contractInstance = new this.props.web3.eth.Contract(
      contractABI,
      CONTRACT_ADDRESSES[this.props.network]
    );
    await this.setStateAsync({ contractInstance });
    await this.refreshDapp();
  }

  async create() {
      const { web3, address } = this.props;
      const { contractInstance, newRiddleQ, newRiddleA, prize } = this.state;
      const hashedAnswer = "0x" + sha256(newRiddleA.toLowerCase());
      contractInstance.methods
        .addRiddle(newRiddleQ, hashedAnswer)
        .send({
          value: web3.utils.toWei(prize),
          from: this.props.address,
          gas: GAS_LIMIT
        })
        .on("transactionHash", hash => {
          this.setState({ pendingCreateTx: hash });
        });
  }

  async answer (riddleId, answer) {
      const { web3, address } = this.props;
      const { contractInstance } = this.state;
      console.log(riddleId, answer.toLowerCase());
      contractInstance.methods
        .answerRiddle(riddleId, answer.toLowerCase())
        .send({ from: this.props.address, gas: GAS_LIMIT })
        .on("transactionHash", hash => {
            this.setState(update(this.state, {
                pendingAnswerTxs: {
                  [riddleId]: { $set: hash }
                }
              }));
        });
  }

  render() {
    const { riddles, newRiddleA, newRiddleQ, prize, pendingCreateTx, pendingAnswerTxs } = this.state;

    const answeredRiddles = riddles.filter(riddle => riddle.answer);
    const unansweredRiddles = riddles.filter(riddle => !riddle.answer);

    return <div id="riddles">
        <img src={RiddleIcon} width={100} />
        <h1>CryptoRiddles</h1>
        <p>
          Post a riddle on the Ethereum blockchain, with a prize for whoever
          answers it.
        </p>
        <p>Answer other people's riddles to claim their prizes.</p>
        <p>
          The answers to the riddles are stored in a sealed format using their <ExternalLink href="https://en.wikipedia.org/wiki/Cryptographic_hash_function">
            cryptographic hash
          </ExternalLink> -- which means they're easy to verify but virtually impossible to guess.
        </p>
        <div id="riddles-main">
          <div>
            <h2>Unanswered</h2>
            {unansweredRiddles.map(riddle => {
              return <Riddle 
                key={riddle.id} 
                {...riddle} 
                pendingTx={pendingAnswerTxs[riddle.id]} 
                web3={this.props.web3} 
                isNetworkSupported={this.props.isNetworkSupported} 
                onAnswer={answer => this.answer(riddle.id, answer)} 
                onFinish={this.refreshDapp.bind(this)} />;
            })}
          </div>
          <div>
            <h2>Answered</h2>
            {answeredRiddles.map(riddle => {
              return <Riddle key={riddle.id} {...riddle} />;
            })}
          </div>
        </div>
        <div id="create-new-riddle">
          <h3>
            <u>Create new Riddle</u>
          </h3>
          <p>
            <input placeholder="Riddle (e.g. What has hands but can not clap?)" value={newRiddleQ} onChange={evt => this.setState(
                  { newRiddleQ: evt.target.value }
                )} />
          </p>
          <p>
            <input placeholder="Answer (e.g. A clock)" value={newRiddleA} onChange={evt => this.setState(
                  { newRiddleA: evt.target.value }
                )} />
          </p>
          <p>
            Prize: <input min="0" step="0.1" type="number" value={prize} onChange={evt => this.setState(
                  { prize: evt.target.value }
                )} /> ether
          </p>
          <WithPendingTransaction web3={this.props.web3} transaction={pendingCreateTx} onFinish={this.refreshDapp.bind(this)}>
            <button disabled={!this.props.isNetworkSupported} onClick={this.create.bind(this)}>
              Create
            </button>
          </WithPendingTransaction>
        </div>

        <p>
          <EtherscanAddressLink network={this.props.network} address={CONTRACT_ADDRESSES[this.props.network]} text="View contract on Etherscan" />
        </p>
      </div>;
  }
}

const Wrapped = () => (
  <EthereumWrapper
    mainNetwork="ropsten"
    supportedNetworks={Object.keys(CONTRACT_ADDRESSES)}
  >
    <App />
  </EthereumWrapper>
);
export default Wrapped;