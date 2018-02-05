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
import InfinityIcon from './infinity.png';
import styled from 'styled-components';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"
import { compose, withProps } from "recompose"
import ReactModal from "react-modal";
import Textarea from "react-expanding-textarea";
import contractABI from './abi';
import DateTime from 'react-datetime';
import moment from 'moment';
import './react-datetime.css';
  
const GAS_LIMIT = 300000;

const CONTRACT_ADDRESSES = {
  ropsten: "0x7e3e3ac6b991acbe0e89cb188bf1ed123e0d0180"
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
  width: 50%;
  text-align: center;
`;

const StyledTextarea = styled(Textarea)`
  outline: none;
  height: 50px;
  resize: none;
  min-height: 200px;
  margin: 0;
  padding: 10px;
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
      width: '500px',
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)"
    }
  };
  

const MyMapComponent = compose(
    withProps({
      googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyBonURHQN9QHaXeWKd2HJYUHhRvpFCOPvA&v=3.exp&libraries=geometry,drawing,places",
      loadingElement: <div style={{ height: `100%` }} />,
      containerElement: <div style={{ height: `400px`, width: '50%', margin: '1em auto' }} />,
      mapElement: <div style={{ height: `100%` }} />,
    }),
    withScriptjs,
    withGoogleMap
  )((props) =>
    <GoogleMap
      onClick={(evt) => props.onClick && props.onClick(evt.latLng.lat(), evt.latLng.lng())}
      defaultZoom={18}
      defaultCenter={props.startingLocation}
    >
    {props.markers.map((marker) => {
        const {location, time, description} = marker;
        return (
            <Marker onClick={() => props.onSelected(marker)} position={location} />
        );
    })}
    </GoogleMap>
  );
  
class App extends SugarComponent {
    state = {
        startingLocation: { lat: 40.7294245, lng: -73.993707 },
        locationQuery: '',
        isMarkerShown: true,
        showCreate: false,
        createLocation: {lat: 0, lng: 0},
        createDescription: '',
        createTime: moment(),
        memories: [],
        selectedMarker: null
    }

    async refreshDapp () {
        const { contractInstance } = this.state;
        const { address } = this.props;
        const numberOfMemories = await contractInstance.methods.numberOfMemories().call();
        let memories = [];
        for (var i = 0; i < numberOfMemories; i++) {
            const result = await contractInstance.methods.memories(i).call();
            const content = JSON.parse(await ipfsCat(result[1]));
            memories.push(content);
        }
        this.setState({ memories });
    }

    async componentDidMount() {
        const contractInstance = new this.props.web3.eth.Contract(
          contractABI,
          CONTRACT_ADDRESSES[this.props.network]
        );
        await this.setStateAsync({ contractInstance });
        await this.refreshDapp();
      }
    
    async createMemory () {
        const { contractInstance, createLocation, createDescription, createTime } = this.state;
        const { address } = this.props;

        const memory = {
            location: createLocation,
            description: createDescription,
            time: createTime.toDate().getTime()
        };

        const memoryHash = await uploadStringToIpfs(JSON.stringify(memory));

        contractInstance.methods
            .createMemory(memoryHash)
            .send({ from: address, gas: GAS_LIMIT })
            .on("transactionHash", hash => {
              this.setState({ pendingTx: hash });
            });
    }


    render () {
        const { 
            locationQuery,
            startingLocation, 
            showCreate, 
            createLocation, 
            createDescription,
            createTime,
            memories,
            selectedMarker
        } = this.state;

        return <Container>
        <ReactModal 
          shouldCloseOnOverlayClick={true} 
          style={customModalStyle} 
          onRequestClose={() => this.setState(
            { showCreate: false}
          )} 
          isOpen={showCreate}>
          <h3><u>Add Memory</u></h3>
          <p><b>Memory Location:</b></p>
          <p>{createLocation.lat}, {createLocation.lng}</p>
          <p><b>Memory Time:</b></p>
          <p>
              <DateTime
                value={createTime}
                onChange={(t) => {
                    this.setState({createTime: t})
                }}
                />
          </p>
          <p><b>Memory Description:</b></p>
          <p><StyledTextarea 
            placeholder='Describe your memory as you remember it'
            value={createDescription} 
            onChange={(evt) => this.setState({createDescription: evt.target.value})}/></p>
          <WithPendingTransaction 
            web3={this.props.web3}
            transaction={this.state.pendingTx}
            onFinish={() => {
                this.setState({
                    createDescription: '',
                    createTime: moment(),
                    createLocation: {lat: 0, lng: 0},
                    showCreate: false
                })
            }}>
          <SmallButton onClick={this.createMemory.bind(this)} disabled={!this.props.isNetworkSupported}>
            Create
          </SmallButton>
          <SmallButton onClick={() => this.setState({ showCreate: false })}>
            Close
          </SmallButton>
          </WithPendingTransaction>
        </ReactModal>
            <img src={InfinityIcon} width={100} />
            <h1>Permanent Memories</h1>
            <p>Store your memories from a location permanently on the blockchain.</p>
            {/* <StyledInput 
                value={locationQuery}
                onChange={(evt) => this.setState({locationQuery: evt.target.value})}
                onKeyPress={(evt) => {
                    if (evt.key !== 'Enter') return;
                    this.searchLocation();
                }}
                placeholder='Enter a location'  /> */}
            <MyMapComponent 
                markers={memories}
                onSelected={(selectedMarker) => {
                    this.setState({selectedMarker});
                }}
                onClick={(lat, lng) => {
                    this.setState({
                        showCreate: true,
                        createLocation: {lat, lng}
                    })
                }}
                startingLocation={startingLocation} />
            {selectedMarker && <p>
                {moment(selectedMarker.time).toString()}: {selectedMarker.description}
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
    <App/>
    </EthereumWrapper>
  );
  export default Wrapped;
  