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
import FaCheck from 'react-icons/lib/fa/check';
import FaClose from 'react-icons/lib/fa/close';
import moment from 'moment';

const Container = styled.div`
  text-align: center;
  margin: 3em 0;
`;

const SmallButton = styled.button`
  margin: 0 1em;
  font-size: 0.9em;
  padding: 0.5em;
`;

const ProposalsContainer = styled.div`
    display: flex;
    width: 75%;
    margin: auto;
    & > div {
        flex: 1;
    }
`;

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
      const passed = diffTime < 0;
      const duration = moment.duration(diffTime, "milliseconds");
      return duration.locale("en").humanize(true); 
    }
  }
  
  const color2str = ({r, g, b}) => `rgb(${r}, ${g}, ${b})`;
  
  const Proposal = ({ id, description, numberOfVotes, currentResult, votingDeadline, onVote, recipient, amount, ended, passed, executed }) => {
      return <div className="proposal">
          <p><b>Description:</b> {description}</p>
          <p><b>Recipient:</b> <EtherscanAddressLink address={recipient} /></p>
          <p><b>Amount:</b> {amount} ETH</p>
          <p><b>Number of Votes:</b> {numberOfVotes}</p>
          <p><b>Current Result:</b> {currentResult}</p>
          {ended && <div>
            <p><b>Passed:</b> {passed ? <FaCheck/> : <FaClose/>}</p>
            <p><b>Executed:</b> {executed ? <FaCheck/> : <FaClose/>}</p>
          </div>}
          <p><Countdown time={votingDeadline} /></p>
        </div>;
  }
  

class App extends SugarComponent {
  state = {
      minimumQuorum: 0,
      debatingPeriodInMinutes: 0,
      majorityMargin: 0,
      addressInput: '',
      contractInstance: null,
      proposals: []
  };

  async refreshDapp () {
    const { contractInstance } = this.state;
    if (!contractInstance) return;
    const minimumQuorum = parseInt(await contractInstance.methods.minimumQuorum().call());
    const debatingPeriodInMinutes = parseInt(await contractInstance.methods.debatingPeriodInMinutes().call());
    const majorityMargin = parseInt(await contractInstance.methods.majorityMargin().call());
    const numProposals = parseInt(await contractInstance.methods.numProposals().call());
    let proposals = [];
    for (var i = 0; i < numProposals; i++) {
        const proposal = await contractInstance.methods.proposals(i).call();
        proposals.push({
            id: i,
            recipient: proposal[0],
            amount: parseInt(proposal[1]),
            description: proposal[2],
            votingDeadline: proposal[3],
            executed: proposal[4],
            passed: proposal[5],
            numberOfVotes: parseInt(proposal[6]),
            currentResult: parseInt(proposal[7])
        })
    }
    this.setState({proposals, minimumQuorum, debatingPeriodInMinutes, majorityMargin});
  }

  async setAddress (addr) {
    const contractInstance = new this.props.web3.eth.Contract(
        contractABI,
        addr
    );
    this.setState({contractInstance}, () => this.refreshDapp());
  }

  render () {
      const { web3, address, isNetworkSupported } = this.props;
      const { 
          addressInput, 
          contractInstance, 
          proposals,
          minimumQuorum,
          debatingPeriodInMinutes,
          majorityMargin
       } = this.state;

      const pastProposals = proposals.filter(
        p => p.votingDeadline * 1000 < Date.now()
      ).reverse();

      const activeProposals = proposals.filter(
        p => p.votingDeadline * 1000 > Date.now()
      );
                  
      return <Container>
            <h1>DAO Inspector</h1>
            <p>Inspect the proposals of a DAO.</p>
            <p>Assumes that the DAO contract implements the interface described <ExternalLink href='https://ethereum.org/dao'>here</ExternalLink>.</p>
            <p>
            <input 
                placeholder='DAO address' 
                value={addressInput} 
                onChange={(evt) => this.setState({addressInput: evt.target.value})} />
            <SmallButton disabled={!isNetworkSupported} onClick={() => {
                this.setAddress(addressInput);
            }}>
                Set Address
            </SmallButton>
            <SmallButton disabled={!isNetworkSupported} onClick={() => {
                this.setState({addressInput:'0xdbf03b407c01e7cd3cbea99509d93f8dddc8c6fb'})
                this.setAddress('0xdbf03b407c01e7cd3cbea99509d93f8dddc8c6fb')
            }}>
                Try an example (ETH-DOGE bounty)
            </SmallButton>
            </p>
            {contractInstance && 
            <div>
              <p><b>Minimum Quorum:</b> {minimumQuorum} voters</p>
              <p><b>Debating Period:</b> {debatingPeriodInMinutes} minutes</p>
              <p><b>Majority Margin:</b> {majorityMargin}%</p>
              <ProposalsContainer style={{display: 'flex'}}>
                <div>
                    <h3>Active Proposals</h3>
                    {activeProposals.map((proposal, idx) => (                    
                        <Proposal key={proposal.id} {...proposal} ended={false} />
                    ))}
                </div>
                <div>
                    <h3>Past Proposals</h3>
                    {pastProposals.map((proposal, idx) => (                    
                        <Proposal key={proposal.id} {...proposal} ended={true} />
                    ))}
                </div>                
            </ProposalsContainer></div>}
        </Container>;
    }
}


const Wrapped = () => (
    <EthereumWrapper
      mainNetwork="mainnet"
      supportedNetworks={['mainnet']}
    >
    <App/>
    </EthereumWrapper>
  );
  export default Wrapped;
  