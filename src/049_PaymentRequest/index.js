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
  ipfsURL,
  isValidEthAddress,
  ZERO_ADDRESS,
  uuid
} from "../common";
import abi from './abi';
import styled from 'styled-components';

const CONTRACT_ADDRESSES = {
    ropsten: '0xd926e4cc8aa2a43800a3d1563c8257e99b62be15'
};
  
const GAS_LIMIT = 300000;

const Container = styled.div`
  text-align: center;
  margin: 3em auto;
`;

const StyledInput = styled.input`
  border: none;
  border-bottom: 1px dashed gray;
  outline: none;
  font-size: 1em;
  text-align: center;
  margin: auto 0.25em;
  padding: 0.3em;
`;

const SmallButton = styled.button`
  margin: 0 1em;
  font-size: 0.9em;
  padding: 0.5em;
`;

const Request = styled.div`
  width: 500px;
  margin: 1em auto;
  padding: 1em;
  border: 1px solid gray;
  border-radius: 5px;
`

class App extends SugarComponent {
  state = {
      balance: 0,
      incoming: [],
      outgoing: [],
      address: '',
      amount: 0,
      message: ''
  }

  async componentDidMount () {
    const { web3 } = this.props;
    const contractInstance = new this.props.web3.eth.Contract(
        abi,
        CONTRACT_ADDRESSES[this.props.network]
      );
    await this.setStateAsync({ contractInstance });
    await this.refreshDapp();
  }

  async refreshDapp () {
    const { contractInstance } = this.state;
    const { address } = this.props;
    const balance = await contractInstance.methods.balances(address).call();
    const nI = await contractInstance.methods.numberOfIncomingRequests().call({from: address});
    let incoming = [];
    for (var i = 0; i < nI; i++) {
        const result = await contractInstance.methods.getIncomingRequest(i).call({from: address});
        incoming.push({
            id: result[0],
            requester: result[1],
            amount: result[2],
            message: result[3]
        });
    }
    const nO = await contractInstance.methods.numberOfOutgoingRequests().call({from: address});
    let outgoing = [];
    for (var i = 0; i < nO; i++) {
        const result = await contractInstance.methods.getOutgoingRequest(i).call({from: address});
        outgoing.push({
            id: result[0],
            requestee: result[1],
            amount: result[2],
            message: result[3]
        });
    }
    this.setState({ balance, incoming, outgoing });
  }

  async request () {
    const { contractInstance, address, amount, message} = this.state;
    const { web3 } = this.props;
    contractInstance
        .methods
        .request(address, web3.utils.toWei(amount.toString()), message)
        .send({ 
            from: this.props.address, 
            gas: GAS_LIMIT
        })
        .on("transactionHash", hash => {
          this.setState({ pendingTx: hash });
        })

  }

  async withdraw () {
    const { contractInstance } = this.state;
    contractInstance
        .methods
        .withdraw()
        .send({ 
            from: this.props.address, 
            gas: GAS_LIMIT
        })
        .on("transactionHash", hash => {
          this.setState({ pendingTx: hash });
        })
  }

  async fulfill (requestId, amount) {
    const { contractInstance } = this.state;
    contractInstance
        .methods
        .fulfill(requestId)
        .send({ 
            value: amount,
            from: this.props.address, 
            gas: GAS_LIMIT
        })
        .on("transactionHash", hash => {
        this.setState({ pendingTx: hash });
        })
  }

  render () {
      const { balance, incoming, outgoing, address, amount, message } = this.state;
      const { web3 } = this.props;

      return <Container>
          <div style={{fontSize: '50px'}}>💸</div>
          <h1>Payment Request</h1>
          <p>Request ether from another address.</p>
          <p>Request
            {' '}
            <StyledInput style={{width: 100}} type='number' value={amount} onChange={(evt) => this.setState({amount: evt.target.value})} />
            {' '}
            ETH from
            {' '}
            <StyledInput placeholder='address' value={address} onChange={(evt) => this.setState({address: evt.target.value})} />
            {' '}
            with message
            <StyledInput placeholder='message' value={message} onChange={(evt) => this.setState({message: evt.target.value})} />
            {' '}
            <WithPendingTransaction
                transaction={this.state.pendingTx}
                pendingMsg=''
                web3={this.props.web3}
                network={this.props.network}
                onFinish={() => {
                    this.setState({
                        amount: 0,
                        address: '',
                        message: ''
                    })
                    this.refreshDapp();
                }}>
            <SmallButton onClick={this.request.bind(this)}>
              Request
            </SmallButton>
            </WithPendingTransaction>
          </p>
          <p>Balance: {balance} ETH
          <WithPendingTransaction
                transaction={this.state.pendingTx}
                pendingMsg=''
                web3={this.props.web3}
                network={this.props.network}
                onFinish={this.refreshDapp.bind(this)}>
              <SmallButton onClick={this.withdraw.bind(this)}>
                  Withdraw
              </SmallButton>
          </WithPendingTransaction>
          </p>
          <p><h3>Incoming</h3></p>
          <div>
          {incoming.map(({id, requester, amount, message}) => {
                return <Request>
                        <div>From: {requester}</div>
                        <div>Amount: {web3.utils.fromWei(amount.toString())} ETH</div>
                        <div>Message: "{message}"</div>
                        <br/>
                        <WithPendingTransaction
                            transaction={this.state.pendingTx}
                            pendingMsg=''
                            web3={this.props.web3}
                            network={this.props.network}
                            onFinish={this.refreshDapp.bind(this)}>
                            <SmallButton onClick={() => this.fulfill(id)}>
                                Fulfill
                            </SmallButton>
                        </WithPendingTransaction>
                    </Request>
            })}
          </div>
          <p><h3>Outgoing</h3></p>
          <div>
            {outgoing.map(({id, requestee, amount, message}) => {
                return <Request>
                        <div>To: {requestee}</div>
                        <div>Amount: {web3.utils.fromWei(amount.toString())} ETH</div>
                        <div>Message: "{message}"</div>
                    </Request>
            })}
          </div>
          <p>
            <EtherscanAddressLink network={this.props.network} address={CONTRACT_ADDRESSES[this.props.network]} text="View contract on Etherscan" />
          </p>            
        </Container>
  }
    
}

const Wrapped = () => (
    <EthereumWrapper
      mainNetwork="ropsten"
      supportedNetworks={['ropsten']}
    >
    <App/>
    </EthereumWrapper>
  );
export default Wrapped;
  