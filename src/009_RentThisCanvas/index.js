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
  ipfsURL,
  uploadFileToIpfs
} from "../common";
import contractABI from "./abi";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import ReactMarkdown from "react-markdown";
import FaFileTextO from "react-icons/lib/fa/file-text-o";
import FaEdit from "react-icons/lib/fa/edit";
import FaHistory from "react-icons/lib/fa/history";
import moment from "moment";
import { Link } from "react-router-dom";
import { CompactPicker } from "react-color";
import P5Wrapper from "react-p5-wrapper";
import sketch from './sketch';

import "./index.css";
import "react-tabs/style/react-tabs.css";
import { setInterval } from "timers";

const CONTRACT_ADDRESSES = {
  ropsten: "0x312d464cc7fcb0cebc45f0352895836c97c86bdd"
};

const GAS_LIMIT = 300000;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";


class Countdown extends Component {
  constructor () {
    super();
    this.state = {now: Date.now()}
  }

  componentDidMount () {
    setInterval(() => { this.setState({now: Date.now()})}, 1000);
  }

  render() {
    const diffTime = this.props.time * 1000 - Date.now();
    const duration = moment.duration(diffTime, "milliseconds");
    return `${duration.hours()} hours, ${duration.minutes()} minutes, ${duration.seconds()} seconds`;
  }
}

class App extends SugarComponent {
  constructor() {
    super();
    this.state = {
      content: "",
      changed: "",
      brushSize: 20,
      color: { r: 96, g: 125, b: 139 },
      currentRentier: ZERO_ADDRESS,
      contentHash: null,
      rentForHours: 1,
      pendingSaveTx: null,
      pendingRentTx: null
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

    const currentRentier = await contractInstance.methods.getCurrentRentier().call();
    const currentExpiry = await contractInstance.methods.getCurrentExpiry().call();
    const pricePerHour = await contractInstance.methods.pricePerHour().call();
    const contentHash = await contractInstance.methods.contentHash().call();

    await this.setStateAsync({ currentRentier, currentExpiry, pricePerHour, contentHash });
  }

  async componentDidMount() {
    await this.setupContract();
    await this.refreshDapp();
  }

  async rent() {
    const { address } = this.props;
    const { contractInstance, rentForHours, pricePerHour } = this.state;
    contractInstance.methods
      .rent(rentForHours)
      .send({ value: rentForHours * pricePerHour, from: address, gas: GAS_LIMIT })
      .on("transactionHash", hash => {
        this.setState({ pendingRentTx: hash });
      });
  }

  async save() {
    const { address } = this.props;
    const { contractInstance } = this.state;

    const canvas = document.getElementById('sketch');
    // console.log(canvas);
    // const ctx = canvas.getContext("2d");
    // console.log(ctx);
    // const imgData = ctx.getImageData(0, 0, 600, 400);
    // const buffer = new ArrayBuffer(600 * 400);
    // const imageArray = new Uint8Array(buffer);

    const cb = async (result) => {
      const hash = await uploadFileToIpfs(result);
     contractInstance.methods
      .setContent(hash)
      .send({
        from: address,
        gas: GAS_LIMIT
      })
      .on("transactionHash", hash => {
        this.setState({ pendingSaveTx: hash });
      });
      
    }
   
    console.log(canvas.toBlob(cb, "image/png"));

  }


  render() {
    const {
      content,
      changed,
      color,
      brushSize,
      currentRentier,
      currentExpiry,
      contentHash,
      pendingSaveTx,
      pendingRentTx,
      rentForHours
    } = this.state;

    console.log(contentHash);

    const hourOrHours = (n) => n === 1 ? 'hour' : 'hours'
    const locked = currentRentier !== this.props.address;

    const contentURL = contentHash ? ipfsURL(contentHash) : null;

    return <div id="rtp-main">
        <h1>Rent this Canvas</h1>
        <div id="canvas-wrapper">
          <div id="tools">
            <p>Color:</p>
            <CompactPicker 
                color={color} 
                onChange={color => this.setState({
                  color: color.rgb
                })} />
            <p>Brush Size:</p>
            <input type="range" min="10" step="1" max="50" value={brushSize} onChange={evt => this.setState(
                  { brushSize: evt.target.value }
                )} />
          </div>
          <div className={`${locked && "locked"}`}>
            <P5Wrapper sketch={sketch} color={color} brushSize={brushSize} locked={locked} startingImg={contentURL}/>
          </div>
        </div>
        {currentRentier === ZERO_ADDRESS ? <div>
            <p>The canvas is currently available to rent.</p>
            <WithPendingTransaction web3={this.props.web3} transaction={pendingRentTx} onFinish={this.refreshDapp.bind(this)}>
              <p>
                Rent for <input onChange={evt => this.setState({
                      rentForHours: evt.target.value
                    })} id="rent-hours-input" type="number" max="24" min="1" value={rentForHours} /> {hourOrHours(rentForHours)}
              </p>
              <button onClick={this.rent.bind(this)} disabled={!this.props.isNetworkSupported}>
                Rent
              </button>
            </WithPendingTransaction>
          </div> : currentRentier === this.props.address ? <div>
            <p><b>You're currently renting the canvas.</b></p>
            <WithPendingTransaction web3={this.props.web3} transaction={pendingSaveTx} onFinish={this.refreshDapp.bind(this)}>
              <button onClick={this.save.bind(this)} disabled={!this.props.isNetworkSupported}>
                Save Canvas
              </button>
              <p>Time until end of lease:</p>
              <p>
                <Countdown time={currentExpiry} />
              </p>
            </WithPendingTransaction>
          </div> : <div>
            <p>
              The canvas is currently being rented by <EtherscanAddressLink network={this.props.network} address={currentRentier} />.
            </p>
            <p>Time until end of lease:</p>
            <p>
              <Countdown time={currentExpiry} />
            </p>
          </div>}

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
