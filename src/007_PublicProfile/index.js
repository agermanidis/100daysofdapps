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
import Dropzone from "react-dropzone";
import FaFileImageO from "react-icons/lib/fa/file-image-o";
import FaEdit from 'react-icons/lib/fa/edit';
import ipfsAPI from "ipfs-api";
import toBuffer from "blob-to-buffer";

import "./index.css";

const CONTRACT_ADDRESSES = {
  ropsten: "0x165d9e99f23ab2ab039e92eb536f9a191663182d"
};

const GAS_LIMIT = 300000;

const ipfs = ipfsAPI("ipfs.infura.io", "5001", { protocol: "https" }); 

const ipfsURL = hash => `https://ipfs.io/ipfs/${hash}`;

class App extends SugarComponent {
  constructor() {
    super();
    this.state = {
      name: "",
      image: "",
      imageFile: null,
      pendingTx: null
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
    const info = await contractInstance.methods.getInfo(address).call();
    const name = info[0];
    const ipfsHash = info[1];
    await this.setStateAsync({
      name: info[0],
      image: ipfsHash ? ipfsURL(ipfsHash) : ""
    });
  }

  async componentDidMount() {
    await this.setupContract();
    await this.refreshDapp();
  }

  async onDrop(files) {
    if (files.length === 0) return;

    const { address, web3 } = this.props;
    const { contractInstance } = this.state;

    await this.setStateAsync({
      image: URL.createObjectURL(files[0]),
      imageFile: files[0]
    });
  }

  async uploadToIpfs(file) {
    return new Promise((resolve, reject) => {
      toBuffer(file, (err, buf) => {
        ipfs.files.add(buf, (err, resp) => {
          if (err) return reject();
          resolve(resp[0].hash);
        });
      });
    });
  }

  async save() {
    const { address } = this.props;
    const { contractInstance, name, imageFile } = this.state;
    let tx;
    if (imageFile) {
      const hash = await this.uploadToIpfs(imageFile);
      tx = contractInstance.methods.setInfo(name, hash);
    } else {
      tx = contractInstance.methods.setNickname(name);
    }
    tx.send({ from: address, gas: GAS_LIMIT }).on("transactionHash", hash => {
      this.setState({ pendingTx: hash });
    });
  }

  onNameChange(evt) {
    this.setState({ name: evt.target.value });
  }

  render() {
    const { name, image, pendingTx } = this.state;

    return (
      <div id="nickname-main">
        <h1>Public Profile</h1>
        <h3>Attach a nickname and picture to your Ethereum address.</h3>
        <h3>
          Any other ÐApp can use it by calling{" "}
          <code>getInfo({"<address>"})</code> on{" "}
          <EtherscanAddressLink
            network={this.props.network}
            address={CONTRACT_ADDRESSES[this.props.network]}
            text="this contract"
          />.
        </h3>
        <h3>
          The picture will be stored on{" "}
          <ExternalLink href="https://ipfs.io/">IPFS</ExternalLink>, a
          decentralized storage network.
        </h3>

        <div>
          <Dropzone
            style={{ backgroundImage: `url(${image})` }}
            accept="image/*"
            className={`profile-pic-dropzone ${image && "has-image"}`}
            onDrop={this.onDrop.bind(this)}
          >
            <div style={{ color: "gray" }}>
              {image ? (
                <div className="reveal-when-hover">
                  <FaEdit /> Change
                </div>
              ) : (
                <div>
                  <FaFileImageO /> Upload picture
                </div>
              )}
            </div>
          </Dropzone>
        </div>
        <p>
          <input
            onChange={this.onNameChange.bind(this)}
            type="text"
            placeholder="nickname"
            value={name}
          />
        </p>

        <WithPendingTransaction
            web3={this.props.web3}
            successMsg={'Updated profile.'}
            failMsg={'Failed to update profile'}
            transaction={pendingTx}
            onFinish={this.refreshDapp.bind(this)}>
          <button
            disabled={!this.props.isNetworkSupported || !name}
            onClick={this.save.bind(this)}
          >
            Save Information
          </button>
        </WithPendingTransaction>
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
