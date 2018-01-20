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
  ipfsURL
} from "../common";
import openSocket from "socket.io-client";
import update from 'immutability-helper';
import './index.css';
import CursorIcon from './cursor.png';

class App extends SugarComponent {
    constructor () {
        super();
        this.state = {
            socket: null,
            wallets: {}
        }
    }

    async refreshDapp () {
        const { web3, address } = this.props;
        const { socket } = this.state;
        const balance = this.props.isNetworkSupported 
            ? await web3.eth.getBalance(address, 'latest') : 0;
        if (balance) socket.emit('join', {balance});
    }

    componentDidMount () {
        const socket = openSocket("https://wallets-online-server-wuvzjwvvvt.now.sh");
        socket.on('update', (socketId, data) => {
            this.setState(update(this.state, {
                wallets: {[socketId]: {$set: data}}
            }));
        });
        socket.on('disconnected', (socketId) => {
            console.log('unsetting', socketId, update(this.state, {
                wallets: {[socketId]: {$unset: [socketId]}}
            }));
            this.setState(update(this.state, {
                wallets: {$unset: [socketId]}
            }));
        });
        this.setState({socket}, this.refreshDapp.bind(this));
    }

    render () {
        console.log(this.state.wallets);
        return <div 
            id='wallets-online'
            onMouseMove={(evt) => {
                const {socket} = this.state;
                if (socket === null) return;
                socket.emit('moved', evt.pageX, evt.pageY);
            }}>
            <h1>Wallets Currently Online</h1>
            {Object.keys(this.state.wallets).map((key, idx) => {
                const {x, y, balance} = this.state.wallets[key];
                return (
                    <div 
                    key={key}
                    style={{
                        position: 'absolute',
                        top: y,
                        left: x
                    }}>
                    <img width={25} src={CursorIcon} />
                    {parseFloat(this.props.web3.utils.fromWei(balance)).toFixed(3)} ETH</div>
                )
            })}
            <footer>
                <p>See the mouse cursor of every visitor on this website, with the balance of their Ethereum wallet attached next to them.</p>
            </footer>
        </div>;
    }
}

const Wrapped = () => (
  <EthereumWrapper
    mainNetwork="ropsten"
    supportedNetworks={['ropsten']}
  >
    <App />
  </EthereumWrapper>
);
export default Wrapped;
