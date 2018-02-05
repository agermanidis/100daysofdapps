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
import ClockIcon from './clock.png';
import BigCalendar from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./index.css";

const Container = styled.div`
  text-align: center;
  margin: 3em;
`;

const SmallButton = styled.button`
  margin: 0 1em;
  font-size: 0.9em;
  padding: 0.5em;
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

const GAS_LIMIT = 300000;

const CONTRACT_ADDRESSES = {
  ropsten: "0x2c1492ab59c787ffe302b26e9eb425c51a77cddd"
};

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment));

class App extends SugarComponent {
  state = {
      slots: [],
      pricePerSecond: "100000000000000000",
      pricePerHour: "100000000000000000",
      pendingTx: null
  };

  async refreshDapp() {
    const { contractInstance } = this.state;
    const pricePerHour = await contractInstance.methods.pricePerHour().call();
    const pricePerSecond = await contractInstance.methods.pricePerSecond().call();
    const numberOfSlots = await contractInstance.methods.numberOfSlots().call();
    let slots = [];
    for (var i = 0; i < numberOfSlots; i++) {
        const slot = await contractInstance.methods.slots(i).call();
        const content = slot[2] ? await ipfsCat(slot[2]) : {};
        slots.push({
            id: i,
            start: slot[0],
            end: slot[1],
            content,
            taker: slot[3]
        });
    } 
    this.setState({ slots, pricePerHour, pricePerSecond });
  }
  
  async componentDidMount() {
    const contractInstance = new this.props.web3.eth.Contract(
      contractABI,
      CONTRACT_ADDRESSES[this.props.network]
    );
    await this.setStateAsync({ contractInstance });
    await this.refreshDapp();
  }

  async selectSlot({ start, end }) {
    const startTime = start.getTime() / 1000;
    const endTime = end.getTime() / 1000;
    const { web3 } = this.props;
    const { contractInstance, pricePerSecond } = this.state;
    contractInstance.methods
      .bookTime(startTime, endTime, "")
      .send({
        value: pricePerSecond * (endTime - startTime),
        from: this.props.address,
        gas: GAS_LIMIT
      })
      .on("transactionHash", hash => {
        this.setState({ pendingTx: hash });
      });
  }

  render() {
    const { pricePerHour, slots, pendingTx } = this.state;

    const events = slots.map(slot => ({
        id: slot.id,
        taker: slot.taker,
        title: this.props.address == slot.taker ? 'Booked by me' : 'Booked by ' + slot.taker,
        start: new Date(slot.start * 1000),
        end: new Date(slot.end * 1000)
    }))

    console.log(events);

    const today = moment()
      .startOf("day")
      .toDate();

    return (
      <Container>
        <img src={ClockIcon} width={100} />
        <h1>Office Hours</h1>
        <p>Book office hours with me.</p>
        <p>Price per hour: {this.props.web3.utils.fromWei(pricePerHour)} ETH</p>
        <WithPendingTransaction transaction={pendingTx} web3={this.props.web3}>
          <BigCalendar
            onSelectSlot={this.selectSlot.bind(this)}
            min={new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9)}
            max={new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17)}
            view="week"
            views={["week"]}
            selectable={true}
            events={events}
            eventPropGetter={(event) => {
                return {
                    style: {
                        backgroundColor: event.taker === this.props.address ? 'red' : 'blue'
                    }
                }
            }} />
        </WithPendingTransaction>
        <p>
          <EtherscanAddressLink
            network={this.props.network}
            address={CONTRACT_ADDRESSES[this.props.network]}
            text="View contract on Etherscan"
          />
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