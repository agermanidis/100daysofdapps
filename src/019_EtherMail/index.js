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
  ipfsURL
} from "../common";
import update from 'immutability-helper';
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import ReactModal from "react-modal";
import contractABI from "./abi";
import "./index.css";
import MdInbox from 'react-icons/lib/md/inbox';
import FaEdit from "react-icons/lib/fa/edit";
import FaArrowCircleUp from 'react-icons/lib/fa/arrow-circle-o-up';
import MdSend from 'react-icons/lib/md/send';
import MdCancel from 'react-icons/lib/md/cancel';
import moment from 'moment';

const CONTRACT_ADDRESSES = {
  ropsten: "0x35a4ec07f242228ed0916bdb8e64f1b575ba88a1"
};

const GAS_LIMIT = 300000;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

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
  constructor() {
    super();
    this.state = {
      inbox: [],
      outbox: [],
      composeOpen: false,
      viewOpen: false,
      pendingTx: null,
      composeOptions: {}
    };
  }

  async refreshDapp() {
    const { web3, address } = this.props;
    const { contractInstance } = this.state;

    const inboxIds = await contractInstance.methods.getInboxIds().call({from: address});
    const outboxIds = await contractInstance.methods.getOutboxIds().call({from: address});

    let inbox = [];
    let outbox = [];

    for (var i = 0; i < inboxIds.length; i++) {
      const id = inboxIds[i];
      const result = await contractInstance.methods.messages(parseInt(id)).call();
      const content = JSON.parse(await ipfsCat(result[1]));
      const from = result[2];
      const to = result[3];
      const time = result[4];
      inbox.push({
        id,
        content,
        from,
        to,
        time
      })
    }

    for (var i = 0; i < outboxIds.length; i++) {
      const id = outboxIds[i];
      const result = await contractInstance.methods.messages(parseInt(id)).call();
      const content = JSON.parse(await ipfsCat(result[1]));
      const from = result[2];
      const to = result[3];
      const time = result[4];
      outbox.push({
        id,
        content,
        from,
        to,
        time
      })
    }

    console.log({inbox, outbox});
    this.setState({inbox, outbox});
  }

  async componentDidMount() {
    const contractInstance = new this.props.web3.eth.Contract(
      contractABI,
      CONTRACT_ADDRESSES[this.props.network]
    );
    await this.setStateAsync({ contractInstance });
    await this.refreshDapp();
  }

  async compose() {
    const { web3, address } = this.props;
    const { contractInstance, composeOptions } = this.state;
    const message = {
      subject: composeOptions.subject,
      content: composeOptions.message
    };
    const messageHash = await uploadStringToIpfs(JSON.stringify(message));
    
    contractInstance.methods
      .sendMessage(composeOptions.recipient, messageHash)
      .send({ from: this.props.address, gas: GAS_LIMIT })
      .on("transactionHash", hash => {
        this.setState({pendingTx: hash})
      });
  }

  render() {
    const {
      currentMsg,
      composeOpen,
      composeOptions,
      inbox,
      outbox,
      pendingTx,
      viewOpen
    } = this.state;
    return <div id="ethermail">
        <h1>Ethermail</h1>
        <p>Send a message to another Ethereum address.</p>
        <button onClick={() => this.setState({ composeOpen: true })}>
          <FaEdit /> Compose
        </button>
        <ReactModal 
          shouldCloseOnOverlayClick={true} 
          style={customModalStyle} contentLabel="Compose new mail" onRequestClose={() => this.setState(
              { viewOpen: false }
            )} isOpen={viewOpen}>
          <div className="modal-content">
            <p>
              From: <EtherscanAddressLink network={this.props.network} address={currentMsg && currentMsg.from} />
            </p>
            <p>
              To: <EtherscanAddressLink network={this.props.network} address={currentMsg && currentMsg.to} />
            </p>
            <p>
              Subject: <b>{currentMsg && currentMsg.content.subject}</b>
            </p>
            <p>Message:</p>
            <div className='msg-box'>{currentMsg && currentMsg.content.content}</div>
            <p>
              <button onClick={() => this.setState({ viewOpen: false })}>
                <MdCancel /> Close
              </button>
            </p>
          </div>
        </ReactModal>
        <ReactModal shouldCloseOnOverlayClick={true} style={customModalStyle} contentLabel="Compose new mail" onRequestClose={() => this.setState(
              { composeOpen: false }
            )} isOpen={composeOpen}>
          <div className="modal-content">
            <h3>Compose New Message</h3>
            <input value={composeOptions.recipient} onChange={evt => this.setState(update(
                    this.state,
                    {
                      composeOptions: {
                        recipient: { $set: evt.target.value }
                      }
                    }
                  ))} placeholder="Recipient address" />
            <input value={composeOptions.subject} onChange={evt => this.setState(update(
                    this.state,
                    {
                      composeOptions: {
                        subject: { $set: evt.target.value }
                      }
                    }
                  ))} placeholder="Subject" />
            <textarea value={composeOptions.message} onChange={evt => this.setState(update(
                    this.state,
                    {
                      composeOptions: {
                        message: { $set: evt.target.value }
                      }
                    }
                  ))} placeholder="Your message here" />
            <WithPendingTransaction web3={this.props.web3} transaction={pendingTx} onFinish={() => {
                this.setState({ composeOptions: {} });
              }}>
              <center>
                <button onClick={this.compose.bind(this)} disabled={!this.props.isNetworkSupported}>
                  <MdSend /> Send
                </button>
                <button onClick={() => this.setState({
                      composeOpen: false
                    })}>
                  <MdCancel /> Cancel
                </button>
              </center>
            </WithPendingTransaction>
          </div>
        </ReactModal>
        <Tabs id="ethermail-main">
          <TabList>
            <Tab>
              <MdInbox /> Inbox
            </Tab>
            <Tab>
              <FaArrowCircleUp /> Sent
            </Tab>
          </TabList>
          <TabPanel>
            <table className="email-list">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Title</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {!inbox.length && <tr style={{ color: "lightgray" }}>
                    <td>{ZERO_ADDRESS}</td>
                    <td>Advice regarding art project</td>
                    <td>1 hour ago</td>
                  </tr>}
                {inbox.map(msg => <tr key={msg.id}>
                    <td>
                      <EtherscanAddressLink network={this.props.network} address={msg.from} />
                    </td>
                    <td>
                      <a
                        onClick={() =>
                          this.setState({ currentMsg: msg, viewOpen: true })
                        }
                      >
                        {msg.content.subject}
                      </a>
                    </td>
                    <td>{moment(parseInt(msg.time) * 1000).fromNow()}</td>
                  </tr>)}
              </tbody>
            </table>
          </TabPanel>
          <TabPanel>
            <table className="email-list">
              <thead>
                <tr>
                  <th>To</th>
                  <th>Title</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {!outbox.length && <tr style={{ color: "lightgray" }}>
                    <td>{ZERO_ADDRESS}</td>
                    <td>You need to check this out!</td>
                    <td>5 minutes ago</td>
                  </tr>}
                {outbox.map(msg => <tr key={msg.id}>
                    <td>
                      <EtherscanAddressLink network={this.props.network} address={msg.to} />
                    </td>
                    <td>
                      <a
                        onClick={() =>
                          this.setState({ currentMsg: msg, viewOpen: true })
                        }
                      >
                        {msg.content.subject}
                      </a>
                    </td>
                    <td>{moment(parseInt(msg.time) * 1000).fromNow()}</td>
                  </tr>)}
              </tbody>
            </table>
          </TabPanel>
        </Tabs>
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