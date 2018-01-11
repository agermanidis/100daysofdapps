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
  ipfsCat,
  ipfsURL
} from "../common";
import contractABI from "./abi";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import ReactMarkdown from 'react-markdown';
import FaFileTextO from "react-icons/lib/fa/file-text-o";
import FaEdit from 'react-icons/lib/fa/edit';
import FaHistory from 'react-icons/lib/fa/history';
import moment from 'moment';

import "./index.css";
import "react-tabs/style/react-tabs.css";

const JsDiff = require('diff');
console.log(JsDiff);


const CONTRACT_ADDRESSES = {
  ropsten: "0xeb8f9fcd930004b2800de83af378efc5e2e20533"
};

const GAS_LIMIT = 300000;

class EditPage extends Component {
    render () {
        const { original, changed, onChange, onSubmit } = this.props;
        const diff = JsDiff.diffWords(original, changed);
        let partEls = [];
        diff.map(function(part) {
          const color = part.added ? "rgba(0, 255, 0, 0.1)" : part.removed ? "rgba(255, 0, 0, 0.1)" : "";
          const lines = part.value.split("\n");
          lines.forEach((line, idx) => {
            partEls.push(<span style={{ background: color }}>
                {line || ' '}
              </span>);
            if (lines.length > 1 && idx !== lines.length - 1) partEls.push(<br/>);
          });
        });

        return <div id="edit-page-main">
            <div>
              <b>Editor</b>
              <textarea onChange={onChange} value={changed} />
            </div>
            <div>
              <b>Changes</b>
              <div id="edit-page-diff">{partEls}</div>
            </div>

            <div id='edit-page-preview'>
              <b>Preview</b>
              <ReactMarkdown source={changed} />
            </div>
          </div>;

    }
}

class App extends SugarComponent {
  constructor() {
    super();
    this.state = {
      content: "",
      changed: "",
      revisions: [],
      pendingSaveTx: null,
      pendingRevertTx: null
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
    try {
        const hash = await contractInstance.methods.getCurrentRevisionHash().call();
        const content = await ipfsCat(hash);
        await this.setStateAsync({ content, changed: content });
    } catch (e) {
        console.log(e.toString());
    }

        let revisions = [];
        const n = await contractInstance.methods.numberOfRevisions().call();
        console.log('number of revs', n);
        for (var i = n-1; i >= 0; i--){
            const revision = await contractInstance.methods.revisions(i).call();
            revisions.push({
              ipfsHash: revision[0],
              timestamp: moment(revision[1] * 1000).toString(),
              address: revision[2]
            });
        }
        await this.setStateAsync({ revisions });
    
  }

  async componentDidMount() {
    await this.setupContract();
    await this.refreshDapp();
  }

  async makeChanges () {
    const { address } = this.props;
    const { contractInstance, changed } = this.state;
    const hash = await uploadStringToIpfs(changed);
    contractInstance.methods
        .addRevision(hash)
        .send({ from: address, gas: GAS_LIMIT })
        .on("transactionHash", hash => {
          this.setState({ pendingSaveTx: hash });
        });
  }

  render() {
    const { content, changed, revisions, pendingSaveTx, pendingRevertTx } = this.state;
    console.log(revisions);

    return <div id="dw-main">
        <h1>Decentralized Wiki</h1>
        <h3>
          A wiki page powered by Markdown, IPFS, and the Ethereum
          blockchain.
        </h3>
        <Tabs>
          <TabList>
            <Tab>
              <FaFileTextO /> Content
            </Tab>
            <Tab>
              <FaEdit /> Edit
            </Tab>
            <Tab>
              <FaHistory /> Revisions
            </Tab>
          </TabList>

          <TabPanel>
            <div id="content">
              <ReactMarkdown source={content} />
            </div>
          </TabPanel>
          <TabPanel>
            <EditPage onChange={evt => this.setState({
                  changed: evt.target.value
                })} original={content} changed={changed} />
            <WithPendingTransaction
                web3={this.props.web3}
                transaction={pendingSaveTx}
                onFinish={this.refreshDapp.bind(this)}>
            <button 
                onClick={this.makeChanges.bind(this)}
                disabled={!this.props.isNetworkSupported || changed === content}>
              Make Changes
            </button>
            <button 
                style={{marginLeft: '1em'}}
                onClick={() => this.setState({ changed: content })}>
              Reset
            </button>
            </WithPendingTransaction>
          </TabPanel>
          <TabPanel>
              <table id='revisions-table'>
              <tr>
                  <th>IPFS URL</th>
                  <th>Timestamp</th>
                  <th>Address</th>
              </tr>
              <br/>
              {revisions.map((rev, idx) => {
                  return (
                    <tr>
                        <td><ExternalLink href={ipfsURL(rev.ipfsHash)}>
                            {truncate(rev.ipfsHash)}
                        </ExternalLink></td>
                        <td>{rev.timestamp}</td>
                        <td><EtherscanAddressLink network={this.props.network} address={rev.address}/></td>
                    </tr>
                  )
              })}
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
