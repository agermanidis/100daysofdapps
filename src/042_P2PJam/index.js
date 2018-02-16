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
import uuid from "uuid/v4";
import moment from 'moment';
import Textarea from 'react-expanding-textarea';
import Y from 'yjs';
import AceEditor from 'react-ace';
import Haikunator from 'haikunator';
import { Route, IndexRoute } from "react-router";
import { HashRouter, Switch, Link } from "react-router-dom";
require('y-ipfs-connector')(Y);

require('y-memory')(Y);
require('y-array')(Y);
require('y-text')(Y);

const haikunator = new Haikunator;

const Container = styled.div`
  text-align: center;
  margin: 3em 0;
`;

const StyledTextarea = styled(Textarea)`
  width: 50%;
  outline: none;
  height: 60vh;
  resize: none;
  min-height: 60vh;
  margin: 0;
  padding: 10px;
`;

class App extends SugarComponent {
    state = {
        ipfs: null,
        addresses: {}
    };

    async addAddress (msg) {
        const { web3 } = this.props;
        const address = await web3.eth.personal.ecRecover(msg.content, msg.signature);
        this.setState(update(this.state, {
            addresses: {[address]: {$set: true}}
        }));
    }

    async componentDidMount () {
        const { web3, address } = this.props;

        const ipfs = new IPFS({
          repo: "/p2pjam/"+Math.random(),
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
            const y = await Y({
                db: {
                  name: 'memory'
                },
                connector: {
                  name: 'ipfs',
                  ipfs: ipfs,
                  room: 'p2pjam-'+this.props.match.params.id
                },
                share: {
                  textarea: 'Text'
                }
              });
            y.share.textarea.bind(document.getElementById('p2p-jam-textarea'));
        });
    }

    render () {
        const { textInput, messages } = this.state;

        return <Container>
            <h1>P2P Jam</h1>
            <p>Collaborate on a text document over IPFS.</p>
            <p>You are in room {this.props.match.params.id}.</p>
            <StyledTextarea id='p2p-jam-textarea' />
          </Container>;
    }
}

class RedirectComponent extends Component {
    componentDidMount () {
        this.props.history.push(`/042_P2PJam/${haikunator.haikunate()}`);
    }

    render () {
        return <p>Loading...</p>;
    }
}

const Wrapped = () => (
    <EthereumWrapper mainNetwork="ropsten" supportedNetworks={["ropsten"]}>
      <HashRouter>
        <Switch>
          <Route exact path="/042_P2PJam" component={RedirectComponent} />
          <Route path="/042_P2PJam/:id" component={App} />
        </Switch>
      </HashRouter>
    </EthereumWrapper>
  );
  export default Wrapped;