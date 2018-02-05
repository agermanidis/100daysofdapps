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
import { TextInput } from "../styles";
import styled from "styled-components";
import MdSend from "react-icons/lib/md/send";
import contractABI from './abi';
import AlarmClock from './alarm.jpeg';
import moment from 'moment';
import FaClockO from 'react-icons/lib/fa/clock-o';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';
import './index.css';

const GAS_LIMIT = 300000;

const CONTRACT_ADDRESSES = {
  ropsten: "0xf62e86cd3e11490d2e406df3132efb83056e3a69"
};

const Container = styled.div`
    text-align: center;
    margin: 3em 0;
`;


const StyledInput = styled.input`
  border: none;
  border-bottom: 1px dashed gray;
  outline: none;
  font-size: 1em;
  text-align: left;
  margin: auto 0.25em;
  padding: 0.3em;
`;

const StyledNumberInput = styled(StyledInput)`
  width: 50px;
`;

const AddressInput = styled(StyledInput)`
  width: 550px;
`;

const NumberInput = props => {
  return <StyledNumberInput style={{textAlign: 'right'}} type="number" {...props} />;
};

const SmallButton = styled.button`
  margin: 0 1em;
  font-size: 0.9em;
  padding: 0.5em;
`;

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
  state = {
      alarmTime: '',
      alarmActive: false,
      inputTime: moment().add(10, 'minutes'),
      pendingTx: null,
      now: 0
  };

  async refreshDapp() {
    const { contractInstance } = this.state;
    const { address } = this.props;
    const alarmActive = await contractInstance.methods.alarmActive(address).call();
    const alarmTime = await contractInstance.methods.alarmTime(address).call();
    this.setState({ alarmActive, alarmTime });
  }

  async componentDidMount() {
    const contractInstance = new this.props.web3.eth.Contract(
      contractABI,
      CONTRACT_ADDRESSES[this.props.network]
    );
    await this.setStateAsync({ contractInstance });
    await this.refreshDapp();
  }

  async setAlarm () {
    const { web3 } = this.props;
    let { contractInstance, inputTime } = this.state;
    if (Date.now() > inputTime.toDate()) {
        inputTime = inputTime.add(1, 'days');
    }
    const time = inputTime.toDate().getTime() / 1000;
    contractInstance.methods
        .setAlarm(time)
        .send({
            value: web3.utils.toWei('0.1'),
            from: this.props.address,
            gas: GAS_LIMIT
        })
        .on("transactionHash", hash => {
          this.setState({ pendingTx: hash });
        });
  
  }

  async stopAlarm () {
    const { contractInstance } = this.state;
    contractInstance.methods
        .stopAlarm()
        .send({
            from: this.props.address,
            gas: GAS_LIMIT
        })
        .on("transactionHash", hash => {
          this.setState({ pendingTx: hash });
        });
  }
  
  render() {
    const { web3 } = this.props;
    const { 
        alarmTime, 
        alarmActive,
        inputTime,
        AMorPM, 
        pendingTx 
    } = this.state;
    return (
        <Container>
            <img src={AlarmClock} width={150} />
            <h2>Alarm Clock with Consequences</h2>
            <p>Submit 0.1 ether as deposit to the alarm clock.</p>
            <p>If you don't wake up in time to stop the alarm, you will lose your ether.</p>
            <br/>
        {
            alarmActive 
            ? <div>
                <p>You have set your alarm clock for <b>{moment(parseInt(alarmTime) * 1000).toString()}</b>.</p>
                <p>You have <Countdown time={alarmTime} /> to stop the alarm until you lose your 0.1 ether.</p>
                <WithPendingTransaction
                    web3={this.props.web3}
                    pendingTx={pendingTx}
                    onFinish={this.refreshDapp.bind(this)}>
                <button onClick={this.stopAlarm.bind(this)} disabled={!this.props.isNetworkSupported}>
                 Stop Alarm
                </button>
                </WithPendingTransaction>
            </div>
            : <WithPendingTransaction
                web3={this.props.web3}
                pendingTx={pendingTx}
                onFinish={this.refreshDapp.bind(this)}>
                <div>
                <p>
                Wake me up at <TimePicker
                    onChange={(inputTime) => this.setState({inputTime})}
                    showSecond={false}
                    defaultValue={moment().add(10, 'minutes')}
                    format='h:mm a'
                    use12Hours
                  />.
                <SmallButton onClick={this.setAlarm.bind(this)} disabled={!this.props.isNetworkSupported}>
                    <FaClockO/> Set alarm clock (0.1 ETH)
                </SmallButton>
                </p>
            </div>
            </WithPendingTransaction>
        }
        <br/>
        <p>
          <EtherscanAddressLink network={this.props.network} address={CONTRACT_ADDRESSES[this.props.network]} text="View contract on Etherscan" />
        </p>
        
      </Container>
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
