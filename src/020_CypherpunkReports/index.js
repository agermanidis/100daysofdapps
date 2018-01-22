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
  NewPostInput,
  isValidEthAddress,
  ZERO_ADDRESS
} from "../common";
import { TextInput } from '../styles';
import contractABI from './abi';
import CRLogo from './CRLogo.png';
import styled from 'styled-components';
import ReactModal from 'react-modal';
import MdCreate from 'react-icons/lib/md/create';
import MdCancel from "react-icons/lib/md/cancel";
import FaThumbsOUp from "react-icons/lib/fa/thumbs-o-up";
import FaThumbsODown from 'react-icons/lib/fa/thumbs-o-down';
import moment from 'moment';

const CONTRACT_ADDRESSES = {
  ropsten: "0x78e837263d2a67a83aa832462692073550ff96a1"
};

const GAS_LIMIT = 300000;

const Container = styled.div`
    text-align: center;
    margin: 3em 0;
`;

const NoResultsText = styled.div`
    margin: 1em;
    color: lightgray;
    font-size: 1em;
`

const InvalidAddressText = styled.div`
    margin: 1em;
    color: rgb(249, 42, 42);
    font-size: 1em;
`;

const ModalButton = styled.button`
    margin: 1em;
    font-size: 0.9em;
`

const SentimentSelector = styled.span`
    padding: 0.5em;
    font-size: 0.9em;
    margin: 1em;
    cursor: pointer;
    border: 1px solid gray;
`;

const ReviewElement = styled.div`
    margin: 0.5em;
`;

const customModalStyle = {
  content: {
    top: "50%",
    left: "50%",
    width: "500px",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)"
  }
};

class App extends SugarComponent {
  constructor() {
    super();
    this.state = {
      queryAddress: "",
      reviewInput: '',
      composeOpen: false,
      reviews: [],
      pendingTx: null,
      reviewIsPositive: true
    };
  }

  async refreshDapp() {
    console.log('refresh dapp');

    const { web3, address } = this.props;
    const { contractInstance, queryAddress } = this.state;

    console.log("refresh dapp", queryAddress, isValidEthAddress(queryAddress));

    if (!isValidEthAddress(queryAddress)) return;

    let numberOfReviews = await contractInstance.methods.numberOfReports(queryAddress).call();

    let reviews = [];

    for (var i = 0; i < numberOfReviews; i++) {
        const review = await contractInstance.methods.reports(queryAddress, i).call();
        const content = JSON.parse(await ipfsCat(review[1]));
        reviews.push({ author: review[0], content, isPositive: review[2], time: review[3]});
    }

    console.log({reviews});

    this.setState({reviews});
  }

  async componentDidMount() {
    const contractInstance = new this.props.web3.eth.Contract(
      contractABI,
      CONTRACT_ADDRESSES[this.props.network]
    );
    await this.setStateAsync({ contractInstance });
    await this.refreshDapp();
  }

  async post () {
    const { web3, address } = this.props;
    const { contractInstance, queryAddress, reviewInput, reviewIsPositive } = this.state;
    const review = { content: reviewInput };
    const contentHash = await uploadStringToIpfs(JSON.stringify(review));
    
    contractInstance.methods
      .addReport(queryAddress, contentHash, reviewIsPositive)
      .send({ from: this.props.address, gas: GAS_LIMIT })
      .on("transactionHash", hash => {
        this.setState({ pendingTx: hash });
      });
  }  

  render() {
    const { queryAddress, reviews, composeOpen, reviewInput, pendingTx, reviewIsPositive } = this.state;
    const validAddress = isValidEthAddress(queryAddress);

    return <Container>
        <ReactModal shouldCloseOnOverlayClick={true} style={customModalStyle} onRequestClose={() => this.setState(
              { composeOpen: false }
            )} isOpen={composeOpen}>
          <p>Write Review</p>
          <center style={{ margin: "1em" }}>
            <SentimentSelector onClick={evt => this.setState({
                  reviewIsPositive: true
                })} style={{ borderColor: reviewIsPositive ? "gray" : "transparent" }}>
              <FaThumbsOUp /> Positive
            </SentimentSelector>
            <SentimentSelector onClick={evt => this.setState({
                  reviewIsPositive: false
                })} style={{ borderColor: !reviewIsPositive ? "gray" : "transparent" }}>
              <FaThumbsODown /> Negative
            </SentimentSelector>
          </center>
          <NewPostInput limit={500} value={reviewInput} onChange={evt => this.setState(
                {
                  reviewInput: evt.target.value
                }
              )} />
          <WithPendingTransaction web3={this.props.web3} transaction={pendingTx} onFinish={() => {
              this.setState({
                reviewInput: "",
                reviewIsPositive: true,
                composeOpen: false
              });
              this.refreshDapp();
            }}>
            <center>
              <ModalButton onClick={this.post.bind(this)} disabled={!this.props.isNetworkSupported}>
                <MdCreate /> Post
              </ModalButton>
              <ModalButton onClick={() => this.setState({
                    composeOpen: false
                  })}>
                <MdCancel /> Cancel
              </ModalButton>
            </center>
          </WithPendingTransaction>
        </ReactModal>
        <img width={100} src={CRLogo} />
        <p>
          Crowd-sourced reviews of Ethereum addresses, published on the
          blockchain.
        </p>
        <div>
          <TextInput style={{ width: "50%" }} value={queryAddress} onChange={async evt => {
              await this.setStateAsync({ queryAddress: evt.target.value });
              this.refreshDapp();
            }} placeholder="Search for an Ethereum address..." />
        </div>
        {validAddress && reviews.length && <div>
              <h3>Reviews</h3>
              {reviews.map((r, idx) => <div key={idx} style={{ margin: "2em" }}>
                  <ReviewElement>
                    {r.isPositive ? <FaThumbsOUp /> : <FaThumbsODown />}
                  </ReviewElement>
                  <ReviewElement>{r.content.content}</ReviewElement>
                  <ReviewElement style={{ color: "gray", fontSize: "0.9em" }}>
                    {moment(parseInt(r.time) * 1000).fromNow()}
                  </ReviewElement>
                  <ReviewElement style={{ color: "gray", fontSize: "0.9em" }}>
                    by <EtherscanAddressLink network={this.props.network} address={r.author} />
                  </ReviewElement>
                </div>)}
            </div>}
        {queryAddress && !validAddress && <InvalidAddressText>
              Invalid address
            </InvalidAddressText>}
        {validAddress && !reviews.length && <NoResultsText>
              No reviews yet for this address
            </NoResultsText>}
        {validAddress && <p>
            <ModalButton onClick={() => this.setState({
                  composeOpen: true
                })}>
              <MdCreate /> Write Review
            </ModalButton>
          </p>}
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
    <App />
  </EthereumWrapper>
);
export default Wrapped;
