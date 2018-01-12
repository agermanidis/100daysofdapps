import React, { Component } from "react";
import {
  SugarComponent,
  BackButton,
  ExternalLink,
  EthereumWrapper,
  EtherscanTxLink,
  EtherscanAddressLink,
  truncate,
  WithPendingTransaction
} from "../common";
import contractABI from "./abi";
import { sha256 } from "js-sha256";
import Dropzone from "react-dropzone";
import moment from 'moment';
import { Link } from "react-router-dom";

import FaFileO from "react-icons/lib/fa/file-o";

import Stamp from './stamp.png';

import './index.css';

const CONTRACT_ADDRESSES = {
  ropsten: "0x2675cf544d4d6f914217a34f98b507e531b266d8"
};

const GAS_LIMIT = 300000;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const FileViewer = ({file}) => {
  const type = file.type.split('/')[0];
  if (type === 'image'){
    return <img width={200} src={file.preview}/>
  } else if (type === 'video') {
    return <video width={200} src={file.preview} />;
  } else if (type === 'audio') {
    return <audio src={file.preview} />;
  } else return <span><FaFileO/> {file.name}</span>
}

class App extends SugarComponent {
  constructor() {
    super();
    this.state = {
      currentItemVerified: false,
      currentItemOwner: ZERO_ADDRESS,
      currentItemTimestamp: 0,
      currentItemHash: null,
      currentItemFile: null,
      pendingTx: null,
      txSucceded: true,
      statusMsg: "",
    };
  }


  async refreshDapp() {
    const { contractInstance, currentItemHash } = this.state;
    if (!currentItemHash) return;
    // check if it already exists
      const exists = await contractInstance.methods.isVerified(currentItemHash).call();
      if (exists) { 
        // get info
        const result = await contractInstance.methods.getInfo(currentItemHash).call();
        await this.setStateAsync({
          currentItemOwner: result[0],
          currentItemTimestamp: result[1]
        })
      }
  }

  async setupContract() {
    const contractInstance = new this.props.web3.eth.Contract(
      contractABI,
      CONTRACT_ADDRESSES[this.props.network]
    );
    await this.setStateAsync({ contractInstance });
  }

  async componentDidMount() {
    await this.setupContract();
    setInterval(this.refreshPending.bind(this), 1000);
  }

  async refreshPending() {
    if (this.state.pendingTx) {
      const { web3 } = this.props;
      const { pendingTx, lastAction } = this.state;
      const receipt = await web3.eth.getTransactionReceipt(pendingTx);
      if (receipt === null) return;
      this.setState({ pendingTx: null });
      await this.refreshDapp();
    }
  }

  async timestamp () {
    const { address, web3 } = this.props;
    const { contractInstance, currentItemHash } = this.state;
    contractInstance.methods
      .verify(currentItemHash)
      .send({ from: address, gas: GAS_LIMIT })
      .on("transactionHash", hash => {
        this.setState({ pendingTx: hash });
      });
  }

  async onDrop(files) {
    if (files.length === 0) return;
    
    const { address, web3 } = this.props;
    const { contractInstance } = this.state;

    await this.setStateAsync({currentItemFile: files[0]});

    const reader = new FileReader;
    reader.onload = async (e) => {
      // get sha256 digest of file
      const hash = '0x' + sha256(e.target.result);
      await this.setStateAsync({currentItemHash: hash});
      await this.refreshDapp();
    }
    reader.readAsBinaryString(files[0]);
  }

  render() {
    const {
      currentItemFile,
      currentItemHash,
      currentItemOwner,
      currentItemTimestamp,
      pendingTx
    } = this.state;
    return <div id="bw-main">
        <img src={Stamp} width={150} />
        <h1>Blockchain Witness</h1>
        <h3>Timestamp media on the Ethereum blockchain.</h3>
        <WithPendingTransaction transaction={pendingTx}>
          {currentItemOwner === ZERO_ADDRESS ? currentItemHash ? <div>
                <p>
                  <FileViewer file={currentItemFile} />
                </p>
                File has not been timestamped yet. <p>
                  <button disabled={!this.props.isNetworkSupported} onClick={this.timestamp.bind(this)}>
                    Timestamp
                  </button>
                </p>
              </div> : <Dropzone className="bw-dropzone" onDrop={this.onDrop.bind(this)}>
                <p style={{ color: "gray" }}>
                  <FaFileO /> Drop any image, video, or audio file
                </p>
              </Dropzone> : <div>
              <FileViewer file={currentItemFile} />
              <p>
                File was timestamped by <EtherscanAddressLink address={currentItemOwner} network={this.props.network} /> on {moment(currentItemTimestamp * 1000).toString()}.
              </p>
            </div>}
        </WithPendingTransaction>
        <p>
          H/T <ExternalLink href="https://twitter.com/baricks/status/950363741782241281">
            Becca Ricks
          </ExternalLink> for the suggestion.
        </p>
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
