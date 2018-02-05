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
import styled from 'styled-components';
import update from 'immutability-helper';
import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';
import ChatroomIcon from './chatroom.png';
import uuid from "uuid/v4";
import moment from 'moment';

const Container = styled.div`
  text-align: center;
  margin: 3em 0;
`;

const StyledInput = styled.input`
  outline: none;
  font-size: 1em;
  text-align: left !important;
  margin: auto 0.25em;
  padding: 0.5em;
  width: 500px;
  text-align: center;
`;

const SmallButton = styled.button`
  margin: 0 1em;
  font-size: 0.9em;
  padding: 0.5em;
`;

const MessagesContainer = styled.div`
  min-height: 300px;
  width: 800px;
  margin: 1em auto;
  display: flex;
  text-align: left;
  justify-content: flex-end;
  flex-direction: column;
  text-align: left;
`;

const myId = Math.floor(Math.random() * 10);
console.log('my id is', myId);

const address =
  "/orbitdb/QmekccMoxZSv89N8NVz5gGfyxPtd2S1MaVo95fwsudSPhH/decentrachat";

var db;

var orbitdb, db;

class App extends SugarComponent {
    state = {
        textInput: '',
        ipfs: null,
        db: null,
        messages: []
    };

    messageExists (msgId) {
        for (var i = 0; i < this.state.messages[i]; i++) {
            const msg = this.state.messages[i];
            if (msg.id === msgId) return true;
        }
        return false;
    }
    
    async verifyMessage (msg) {
        const { web3 } = this.props;
        return msg.address === await web3.eth.personal.ecRecover(msg.content, msg.signature);
    }

    async componentDidMount () {
        const { web3, address } = this.props;

        const ipfs = new IPFS({
            repo: "/orbitdb/examples/browser/new/ipfs/0.27.3",
            start: true,
            EXPERIMENTAL: {
              pubsub: true
            },
            config: {
              Addresses: {
                Swarm: [
                  "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star"
                ]
              }
            }
          });
        ipfs.on('ready', async () => {
            orbitdb = new OrbitDB(ipfs);
            db = await orbitdb.eventlog(address, {sync: true});
            db.events.on("replicated", address => {
                let newMsgs = db.iterator({ limit: -1 }).collect();
                for (var i = 0; i < newMsgs.length; i++) {
                    const msg = newMsgs[i].payload.value;
                    if (this.messageExists(msg.id)) continue;
                    if (!this.verifyMessage(msg)) continue;
                    this.setState(update(this.state, {
                        messages: {$push: [msg]}
                    }));
                }
            });
            this.setState({db, ipfs})
        });
    }

    async submit () {
        const { web3, address } = this.props;
        const { textInput } = this.state;
        const msg = { 
            id: uuid(), 
            content: textInput, 
            signature: await web3.eth.personal.sign(textInput, address), 
            time: new Date().toString(), 
            address 
        };

        db.add(msg);
        this.setState(update(this.state, {
            textInput: { $set: "" },
            messages: { $push: [msg] }
        }));
    }

    render () {
        const { textInput, messages } = this.state;

        return <Container>
            <img src={ChatroomIcon} width={100} />
            <h1>Decentrachat</h1>
            <p>Peer-to-peer chatroom prototype.</p>
            <p>
              Uses Ethereum as identity provider, <ExternalLink href="https://github.com/orbitdb/orbit-db">
                OrbitDB
              </ExternalLink> as data store.
            </p>

            <MessagesContainer>
              {messages.map((msg, idx) => <div key={msg.id}>
                  <b>
                    <EtherscanAddressLink 
                        truncate={true}
                        address={msg.address} 
                        network={this.props.network} /> <span
                      style={{ color: "gray" }}
                    >
                      ({moment(msg.time).format('LT')})
                    </span>
                  </b> <span style={{margin: '0 1em'}}>{msg.content}</span>
                </div>)}
            </MessagesContainer>

            <StyledInput 
                onKeyPress={(evt) => {
                    if (evt.key === 'Enter') this.submit();
                }}
                placeholder="Type a message" value={textInput} onChange={evt => this.setState(
                  { textInput: evt.target.value }
                )} />

            <SmallButton onClick={this.submit.bind(this)}>
              Send
            </SmallButton>
          </Container>;
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