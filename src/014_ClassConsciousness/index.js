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
import contractABI from "./abi";
import Dropzone from "react-dropzone";
import Textarea from "react-expanding-textarea";
import FaFileImageO from "react-icons/lib/fa/file-image-o";
import MarxIcon from './marx.svg';
import moment from 'moment';

import "./index.css";

const GAS_LIMIT = 300000;

const CONTRACT_ADDRESSES = {
  ropsten: "0x82127d71c0da8f2d60b4e41fb3b5355f01a97397"
};

const ClassColumn = ({ name, low, high, msgs, isItMyClass, children }) => {
  console.log(isItMyClass);
  return (
    <div className={`class-column ${isItMyClass && 'my-class'}`}>
      <div className='header'>
        <div className='name'><u>{name}</u></div>
        <div>{low} to {high} ether</div>
        {isItMyClass && <small>(you belong here)</small>}
        {children}
      </div>
    </div>
  );
};

const Broadcast = ({
  message,
  network,
  time,
  image,
}) => {
  return (
    <div className="status">
      <div>
        <div className="message">{message}</div>
        {image && (
          <ExternalLink href={ipfsURL(image)}>
            <img className="image" src={ipfsURL(image)} />
          </ExternalLink>
        )}
        <div className="time">{moment(parseInt(time) * 1000).fromNow()}</div>
      </div>
    </div>
  );
};

class App extends SugarComponent {
  constructor() {
    super();
    this.state = {
      msg: "",
      image: "",
      pendingTx: null,
      myClass: -1,
      broadcastsPerClass: {
        0: [],
        1: [],
        2: []
      },
      socialClasses: [
          {
              idx: 0,
              name: 'Lower Class',
              low: 0,
              high: 2
          },
          {
              idx: 1,
              name: 'Middle Class',
              low: 2,
              high: 10
          },
          {
              idx: 2,
              name: 'Upper Class',
              low: 10,
              high: '∞'
          }
      ]
    };
  }

  async refreshDapp() {
    const { web3, address } = this.props;
    const { contractInstance } = this.state;
    
    const myBalance = this.props.isNetworkSupported ? await web3.eth.getBalance(address, 'latest') : 0;
    const myClass = this.props.isNetworkSupported ? await contractInstance.methods.getClass(myBalance).call({from: address}) : -1;
    const count = await contractInstance.methods.numberOfBroadcasts().call();
    let broadcastsPerClass = {
        0: [],
        1: [],
        2: []
    };
    for (var i = count - 1; i >= 0; i--) {
        const result = await contractInstance.methods
            .broadcasts(i)
            .call();
        const timestamp = result[1];
        const content = JSON.parse(await ipfsCat(result[2]));
        const socialClass = result[3]
        broadcastsPerClass[socialClass].push({ timestamp, content });
    }
    console.log(broadcastsPerClass);
    this.setState({ broadcastsPerClass, myClass: parseInt(myClass) });
  }

  async componentDidMount () {
    const contractInstance = new this.props.web3.eth.Contract(
        contractABI,
        CONTRACT_ADDRESSES[this.props.network]
    );
    await this.setStateAsync({ contractInstance });
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

  async broadcast() {
    const { address } = this.props;
    const { contractInstance, msg, imageFile } = this.state;

    const status = {
      message: msg,
      imageHash: imageFile && (await uploadFileToIpfs(imageFile))
    };

    const statusHash = await uploadStringToIpfs(JSON.stringify(status));

    contractInstance.methods
      .broadcast(statusHash)
      .send({ from: address, gas: GAS_LIMIT })
      .on("transactionHash", hash => {
        this.setState({ pendingTx: hash });
      });
  }

  render() {
    const { msg, image, socialClasses, pendingTx, myClass, broadcastsPerClass } = this.state;
    console.log({myClass});
    return <div id="class-consciousness">
        <img width={100} src={MarxIcon} />
        <h1>Class Consciousness</h1>
        <h3>Express yourself through your social class.</h3>
        <div id="input-container">
          <div id="input-container-box">
            <Textarea maxLength="300" value={msg} onChange={evt => {
                this.setState({ msg: evt.target.value });
              }} ref={input => (this.input = input)} placeholder="What do you want to say?" />
            <span className="msg-limit">{msg.length}/300</span>
            <Dropzone className="img-drop" accept="image/*" onDrop={this.onDrop.bind(this)}>
              <FaFileImageO />
            </Dropzone>
          </div>
          {image && <img src={image} />}
        </div>
        <WithPendingTransaction web3={this.props.web3} transaction={pendingTx} successMsg="Broadcast succeded." onFinish={() => {
            this.setState({ 
                msg: "", 
                image: "", 
                imageFile: null 
            });
            this.refreshDapp();
          }}>
          <button onClick={this.broadcast.bind(this)} disabled={!this.props.isNetworkSupported}>
            Submit
          </button>
        </WithPendingTransaction>
          <h3>Broadcasts</h3>
        <div id='social-classes'>
            {socialClasses.map((info, i) => {
                return <ClassColumn 
                            key={i} 
                            isItMyClass={myClass === info.idx} 
                            {...info}>

                            {broadcastsPerClass[info.idx].map((broadcast, j) => {
                                return (
                                    <Broadcast 
                                        network={this.props.network}
                                        message={broadcast.content.message}
                                        time={broadcast.timestamp}
                                        image={broadcast.image} />
                                );
                            })}
                        
                        </ClassColumn>;
            })}
        </div>
        <div>
          <EtherscanAddressLink network={this.props.network} address={CONTRACT_ADDRESSES[this.props.network]} text="View contract on Etherscan" />
        </div>
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
