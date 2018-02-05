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
} from "../common";
import contractABI from "./abi";
import moment from "moment";
import { Link } from "react-router-dom";
import { SketchPicker } from "react-color";
import FaCheck from 'react-icons/lib/fa/check';
import FaClose from 'react-icons/lib/fa/close';
import update from 'immutability-helper';


import "./index.css";
import { setInterval } from "timers";

const CONTRACT_ADDRESSES = {
  ropsten: "0x7ca0e7fabdbf5a924d4a9209060dda390a9ad24b"
};

const GAS_LIMIT = 300000;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";


class Countdown extends Component {
  constructor() {
    super();
    this.state = { now: Date.now() };
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({ now: Date.now() });
    }, 1000);
  }

  render() {
    const diffTime = this.props.time * 1000 - Date.now();
    const duration = moment.duration(diffTime, "milliseconds");
    return `${duration.minutes()} minutes, ${duration.seconds()} seconds left`;
  }
}

const color2str = ({r, g, b}) => `rgb(${r}, ${g}, ${b})`;

const Proposal = ({ id, yayVotes, nayVotes, hasVoted, color, votingDeadline, onVote, web3, pendingVoteTx, isNetworkSupported }) => {
    return <div className="proposal">
        <p>
          <small>Proposal #{id}.</small> <p>Change the color to</p>
          <div className="color-square" style={{ backgroundColor: color2str(color) }}>
            {" "}
          </div>
          {color.r}, {color.g}, {color.b}
        </p>
        <p>
          <Countdown time={votingDeadline} />
        </p>
        <WithPendingTransaction web3={web3} transaction={pendingVoteTx}>
            <button onClick={() => onVote(true)} disabled={!isNetworkSupported || hasVoted}>
              <FaCheck /> Yay ({yayVotes})
            </button> <button onClick={() => onVote(false)} disabled={!isNetworkSupported || hasVoted}>
              <FaClose /> Nay ({nayVotes})
            </button>
            {hasVoted && <span>You already voted</span>}
        </WithPendingTransaction>
        <p>
          <EtherscanAddressLink network={this.props.network} address={CONTRACT_ADDRESSES[this.props.network]} text="View contract on Etherscan" />
        </p>
        
      </div>;
}

class App extends SugarComponent {
  constructor() {
    super();
    this.state = {
      currentColor: { r: 255, g: 255, b: 255 },
      selectedColor: { r: 255, g: 255, b: 255 },
      proposals: [],
      pendingVoteTxs: {},
      pendingProposeTx: null,
      now: Date.now()
    };
  }

  async setupContract() {
    const contractInstance = new this.props.web3.eth.Contract(
      contractABI,
      CONTRACT_ADDRESSES[this.props.network]
    );
    await this.setStateAsync({ contractInstance });
  }

  async refreshDapp() {
    const { contractInstance } = this.state;
    const { address } = this.props;

    const currentColor = await contractInstance.methods
        .currentColor()
        .call();
    const numberOfProposals = await contractInstance.methods
        .numberOfProposals()
        .call();

    console.log("current", currentColor);

    let proposals = [];
    for (let i = numberOfProposals - 1; i >= 0; i--) {
      const proposal = await contractInstance.methods.getProposal(i).call({from:this.props.address});
      console.log(proposal);
      proposals.push({
        id: i,
        color: { r: proposal[0], g: proposal[1], b: proposal[2] },
        yayVotes: proposal[3],
        nayVotes: proposal[4],
        votingDeadline: proposal[5],
        hasVoted: proposal[6]
      });
    }

    await this.setStateAsync({
      proposals,
      currentColor: {
          r: parseInt(currentColor[0]),
          g: parseInt(currentColor[1]),
          b: parseInt(currentColor[2]),
      }
    });
  }

  filteredProposals() {
    return this.state.proposals.filter(
      p => p.votingDeadline * 1000 > Date.now()
    );
  }

  async componentDidMount() {
    await this.setupContract();
    await this.refreshDapp();
    setInterval(() => {
      this.setState({ now: Date.now() });
    }, 1000);
  }

  async vote (proposalId, supportsProposal) {
    const { address } = this.props;
    const { contractInstance } = this.state;

    contractInstance.methods
      .vote(proposalId, supportsProposal)
      .send({ from: address, gas: GAS_LIMIT })
      .on("transactionHash", hash => {
        this.setState(update(this.state, {
            pendingVoteTxs: { [proposalId]: { $set: hash } }
          }));
      });
  }

  async propose() {
    const { address } = this.props;
    const { contractInstance, selectedColor } = this.state;

    contractInstance.methods
      .propose(selectedColor.r, selectedColor.g, selectedColor.b)
      .send({
        from: address,
        gas: GAS_LIMIT
      })
      .on("transactionHash", hash => {
        this.setState({ pendingProposeTx: hash });
      });
  }

  render() {
    const {
      selectedColor,
      currentColor,
      proposals,
      pendingProposeTx,
      pendingVoteTxs,
      rentForHours
    } = this.state;

    return (
      <div id="bcd-main" style={{ backgroundColor: color2str(currentColor) }}>
        <h1>Background Color Democracy</h1>
        <p>
          Submit and vote on proposals for changing the background color of this
          page.
        </p>
        <div id="bcd-content">
          <center>
            <p>
              <b>Active Proposals:</b>
            </p>
            <div>
              {this.filteredProposals().map((p, idx) => (
                <Proposal 
                    key={idx} {...p} 
                    isNetworkSupported={this.props.isNetworkSupported} 
                    onVote={(supportsProposal) => this.vote(p.id, supportsProposal)}
                    web3={this.props.web3}
                    pendingVoteTx={pendingVoteTxs[p.id] || null} />
              ))}
            </div>
          </center>
          <center>
            <p>
              <b>Propose New Color:</b>
            </p>
            <SketchPicker
              color={selectedColor}
              onChange={color =>
                this.setState({
                  selectedColor: color.rgb
                })
              }
            />
            <br />
            <WithPendingTransaction
              web3={this.props.web3}
              transaction={pendingProposeTx}
              onFinish={this.refreshDapp.bind(this)}
            >
              <button
                onClick={this.propose.bind(this)}
                disabled={!this.props.isNetworkSupported}
              >
                Propose
              </button>
            </WithPendingTransaction>
          </center>
        </div>
        <p>
          <EtherscanAddressLink
            network={this.props.network}
            address={CONTRACT_ADDRESSES[this.props.network]}
            text="View contract on Etherscan"
          />
        </p>
      </div>
    );
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
