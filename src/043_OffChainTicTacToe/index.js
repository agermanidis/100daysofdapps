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
import gameABI from './abi';
import styled from 'styled-components';
import TicTacToeIcon from './tictactoe.png';
import { Route, IndexRoute } from "react-router";
import { HashRouter, Switch, Link } from "react-router-dom";
import Haikunator from 'haikunator';
import IPFS from 'ipfs';
import Room from 'ipfs-pubsub-room';

const haikunator = new Haikunator;

const GAS_LIMIT = 300000;

const CONTRACT_ADDRESSES = {
    ropsten: '0xa6ad822a5b03bdab78751ed70184e3dc5e81131b'
};

const Container = styled.div`
  text-align: center;
  margin: 3em 0;
`;

const Row = styled.div`
    display: flex;
`;

const RowSep = styled.div`
    border-top: 1px solid gray;
`;

const ColSep = styled.div`
    border-left: 1px solid gray;
`;

const Square = styled.div`
    width: 100px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 50px;
`;

const TicTacToeContainer = styled.div`
    width: 300px;
    margin: auto;
`;

const TicTacToe = ({gameState, canInteract, onMark}) => {
    const markFn = i => evt => {
        if (!canInteract) return;
        if (gameState[i] != '0') return;
        onMark(i);
    }
    const contentFn = i => {
        if (gameState[i] === '1') return 'x';
        else if (gameState[i] === '2') return 'o';
        else return '';
    }
    return <TicTacToeContainer>
            <Row>
                <Square onClick={markFn(0)}>{contentFn(0)}</Square>
                <ColSep />
                <Square onClick={markFn(1)}>{contentFn(1)}</Square>
                <ColSep />
                <Square onClick={markFn(2)}>{contentFn(2)}</Square>
            </Row>
            <RowSep />
            <Row>
                <Square onClick={markFn(3)}>{contentFn(3)}</Square>
                <ColSep />
                <Square onClick={markFn(4)}>{contentFn(4)}</Square>
                <ColSep />
                <Square onClick={markFn(5)}>{contentFn(5)}</Square>
            </Row>
            <RowSep />
            <Row>
                <Square onClick={markFn(6)}>{contentFn(6)}</Square>
                <ColSep />
                <Square onClick={markFn(7)}>{contentFn(7)}</Square>
                <ColSep />
                <Square onClick={markFn(8)}>{contentFn(8)}</Square>
            </Row>                
        </TicTacToeContainer>;
}

class App extends SugarComponent {
    state = {
        gameId: '',
        loaded: false,
        player1: ZERO_ADDRESS,
        player2: ZERO_ADDRESS,
        whoAmI: 0,
        lastNonce: 0,
        gameState: '0000000002',
        room: null
    };

    async verifyMessage (content, signature, address) {
        const { web3 } = this.props;
        return address === await web3.eth.personal.ecRecover(content, signature);
    }

    async componentDidMount () {
        const contractInstance = new this.props.web3.eth.Contract(
          gameABI,
          CONTRACT_ADDRESSES[this.props.network]
        );
        await this.setStateAsync({ contractInstance });
        await this.refreshDapp();
        await this.initIPFS();
    }

    async initIPFS () {
        const ipfs = new IPFS({
            repo: "/tictactoe/"+Math.random(),
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
        
        ipfs.on('ready', () => {
            const room = Room(ipfs, this.state.gameId);
            this.setState({room});
  
            room.on('peer joined', (peer) => {
              console.log('Peer joined the room', peer);
            })
  
            room.on('peer left', (peer) => {
              console.log('Peer left...', peer);
            })
  
            room.on('subscribed', () => {
              console.log('Now connected!');
            })

            room.on('message', (message) => {
                const msg = JSON.parse(message.data.toString());
                const { player1, player2 } = this.state;
                const { gameState, nonce, signature } = msg;
                // verify player
                if (msg.address !== player1 && msg.address !== player2) return;
                if (!this.verifyMessage(gameState+nonce, signature, msg.address)) return; 
                // check if nonce is higher than current nonce
                if (msg.nonce <= this.state.lastNonce) return;
                // check if move is valid
                this.setState({gameState, lastNonce: nonce});
            })
        });
    }

    async submitMove (gameState) {
        const { room, lastNonce } = this.state;
        const { web3, address } = this.props;
        const nonce = lastNonce + 1;
        this.setState({gameState});
        room.broadcast(JSON.stringify({
            nonce,
            gameState,
            address,
            signature: await web3.eth.personal.sign(gameState+nonce, address)
        }));
    }

    async refreshDapp () {
        const { contractInstance } = this.state;
        const { address } = this.props;
        let whoAmI = -1;
        const gameId = window.location.hash.split('/').slice(-1)[0];
        const player1 = await contractInstance.methods.getPlayer1(gameId).call();
        if (player1 === address) whoAmI = 1;
        const player2 = await contractInstance.methods.getPlayer2(gameId).call();
        if (player2 === address) whoAmI = 2;
        const winner = await contractInstance.methods.getWinner(gameId).call();
        await this.setStateAsync({ gameId, player1, player2, winner, whoAmI, loaded: true });
    }

    async join () {
        const { web3, address } = this.props;
        const { contractInstance, gameId } = this.state;
        contractInstance
          .methods
          .join(gameId)
          .send({ 
              from: this.props.address, 
              gas: GAS_LIMIT
          })
          .on("transactionHash", hash => {
            this.setState({ pendingTx: hash });
          })
    }

    render () {
        let { loaded, player1, player2, winner, whoAmI, gameId, pendingTx, gameState } = this.state;
        if (!loaded) return <p>Loading...</p>;
        if (player1 === ZERO_ADDRESS) return <p>Room does not exist.</p>;
        return <Container>
            <h1>Off-Chain Tic-Tac-Toe</h1>
            <p>You are in room <b>{gameId}</b>.</p>
            <p>Player 1 is <EtherscanAddressLink address={player1} network={this.props.network} /></p>
            {player2 !== ZERO_ADDRESS && <p>Player 2 is <EtherscanAddressLink address={player2} network={this.props.network} /></p>}
            {player2 === ZERO_ADDRESS && whoAmI === 1 && <p>Waiting for another player to join...</p>}
            {player2 === ZERO_ADDRESS && whoAmI === 0 && <div>
                <WithPendingTransaction
                    web3={this.props.web3}
                    transaction={pendingTx}
                    onFinish={this.refreshDapp.bind(this)}>
                <button disabled={!this.props.isNetworkSupported} onClick={this.join.bind(this)}>
                    Join
                 </button>
                 </WithPendingTransaction>
             </div>}
            {player1 && player2 && 
                <TicTacToe
                    gameState={gameState} 
                    onMark={(square) => {
                        let newState = gameState.substr(0, square) + whoAmI + gameState.substr(square + 1);
                        this.submitMove(newState);
                    }}
                    canInteract={whoAmI !== 0}
                  />}
            <p>
               <EtherscanAddressLink 
                    network={this.props.network} 
                    address={CONTRACT_ADDRESSES[this.props.network]} 
                    text="View contract on Etherscan" />
            </p>
        </Container>;
    }
}

class RedirectComponent extends SugarComponent {
    state = {
        pendingTx: null,
        confirmed: false
    };

    async componentDidMount () {
        const contractInstance = new this.props.web3.eth.Contract(
          gameABI,
          CONTRACT_ADDRESSES[this.props.network]
        );
        await this.setStateAsync({ contractInstance });
    }

    async newGame () {
        const { web3, address } = this.props;
        const { contractInstance } = this.state;
        const name = haikunator.haikunate();
        this.setState({name});
        contractInstance
          .methods
          .newGame(name)
          .send({ 
              from: this.props.address, 
              gas: GAS_LIMIT
          })
          .on("transactionHash", hash => {
            this.setState({ pendingTx: hash });
          })
    }

    render () {
        return <Container>
            <img src={TicTacToeIcon} width={100} />
            <h1>Off-Chain Tic-Tac-Toe</h1>
            <p>Tic Tac Toe demo using <ExternalLink href='http://www.jeffcoleman.ca/state-channels/'>state channels</ExternalLink>.</p>
            <WithPendingTransaction
                transaction={this.state.pendingTx}
                web3={this.props.web3}
                network={this.props.network}
                onFinish={() => {
                    window.location.hash = `/043_OffChainTicTacToe/${this.state.name}`;
                }}>
                <button disabled={!this.props.isNetworkSupported} onClick={this.newGame.bind(this)}>
                    New Game
               </button>
            </WithPendingTransaction>
            <p>
               <EtherscanAddressLink network={this.props.network} address={CONTRACT_ADDRESSES[this.props.network]} text="View contract on Etherscan" />
            </p>
        </Container>;
    }
}

const Wrapped = () => (    
      <HashRouter>
        <Switch>
          <Route exact path="/043_OffChainTicTacToe" component={() => (
            <EthereumWrapper mainNetwork="ropsten" supportedNetworks={["ropsten"]}>
              <RedirectComponent />
            </EthereumWrapper>
          )} />
          <Route path="/043_OffChainTicTacToe/:id" component={() => (
            <EthereumWrapper mainNetwork="ropsten" supportedNetworks={["ropsten"]}>
                <App />
            </EthereumWrapper>
          )} />
        </Switch>
      </HashRouter>
  );
  export default Wrapped;