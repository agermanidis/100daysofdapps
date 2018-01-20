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
import contractABI from './abi';
import update from 'immutability-helper';
import './index.css';
import AdvisorIcon from './advisor.png';

const CONTRACT_ADDRESSES = {
  ropsten: "0x62195f5c861041e49C5998f8F50f26008B120815"
};

const GAS_LIMIT = 300000;

const PENDING = 0;
const APPROVED = 1;
const REJECTED = 2;
const CANCELLED = 3;

const Transaction = ({destination, value, canCancel, onCancel, isNetworkSupported}) => {
    return <div className='transaction'>
        Transfer {value} ETH{' '}
        to: {destination}{' '}
        {canCancel && <button onClick={onCancel} disabled={!isNetworkSupported}>
          Cancel
        </button>}
      </div>;
}

class App extends SugarComponent {
    constructor () {
        super();
        this.state = {
            destination: '',
            amount: 0,
            transactions: [],
            pendingRequestTx: null,
            pendingCancelTxs: {}
        };
    }

    async refreshDapp () {
        const { web3, address } = this.props;
        const { contractInstance } = this.state;
        
        const numberOfTransactions = await contractInstance.methods
            .numberOfTransactions()
            .call();

        let transactions = [];

        for (var i = 0; i < numberOfTransactions; i++) {
            const transaction = await contractInstance.methods
                .transactions(i)
                .call({from: address});
            if (transaction[0] === address) {
                transactions.push({
                    id: i,
                    sender: transaction[0],
                    destination: transaction[1],
                    value: web3.utils.fromWei(transaction[2]),
                    reason: transaction[3],
                    state: parseInt(transaction[4])
                });
            }
        }

        this.setStateAsync({ transactions });
    }

    async componentDidMount () {
        const contractInstance = new this.props.web3.eth.Contract(
            contractABI,
            CONTRACT_ADDRESSES[this.props.network]
        );
        await this.setStateAsync({ contractInstance });
        await this.refreshDapp();
    }

    async request () {
        const { web3, address } = this.props;
        const { contractInstance, amount, destination } = this.state;
        contractInstance.methods
          .request(destination, '')
          .send({
            value: web3.utils.toWei(amount.toString()),
            from: this.props.address,
            gas: GAS_LIMIT
          })
          .on("transactionHash", hash => {
            this.setState({ pendingRequestTx: hash });
          });
    }

    async cancelTransaction (transactionId) {
        const { web3, address } = this.props;
        const { contractInstance } = this.state;
        contractInstance.methods
          .cancel(transactionId)
          .send({
            from: this.props.address,
            gas: GAS_LIMIT
          })
          .on("transactionHash", hash => {
            this.setState(update(this.state, {
                pendingCancelTxs: {
                    [transactionId]: { $set: hash }
                }
            }));
          });
    }

    render () {
        const {destination, amount, transactions, pendingRequestTx, pendingCancelTxs} = this.state;

        const pendingTransactions = transactions.filter(t => t.state === PENDING);
        const approvedTransactions = transactions.filter(t => t.state === APPROVED);
        const rejectedTransactions = transactions.filter(t => t.state === REJECTED);

        console.log(transactions);

        return <div id="advisor-main">
            <img src={AdvisorIcon} width={100} />
            <h2>Your Personal Advisor</h2>
            <p>Let me vet your transactions.</p>
            <div>
              Submit a transfer of Ether you're planning to make.
            </div>
            <ul>
              <li>
                If I think that the transfer is a good idea, I will
                approve the transaction and the Ether will reach its
                destination.
              </li>
              <li>
                If I think it's a bad idea, I will reject the
                transaction and the Ether will go back into your wallet.
              </li>
              <li>
                You can cancel the transaction and get your Ether back
                anytime.
              </li>
            </ul>
            <WithPendingTransaction web3={this.props.web3} transaction={pendingRequestTx} onFinish={this.refreshDapp.bind(this)}>
              <div>
                Transfer <input type="number" value={amount} onChange={evt => this.setState(
                      { amount: evt.target.value }
                    )} />
                to: <input value={destination} placeholder="Recipient address" onChange={evt => this.setState(
                      { destination: evt.target.value }
                    )} />
                <button onClick={this.request.bind(this)} disabled={!this.props.isNetworkSupported}>
                  Submit
                </button>
              </div>
            </WithPendingTransaction>
            <div>
              <h3>Pending Approval</h3>
              {pendingTransactions.map((t, idx) => (
                <WithPendingTransaction web3={this.props.web3} transaction={pendingCancelTxs[idx]}>
                <Transaction
                  key={t.id}
                  {...t}
                  isNetworkSupported={this.props.isNetworkSupported}
                  canCancel={true}
                  onCancel={() => this.cancelTransaction(t.id)}
                />
                </WithPendingTransaction>
              ))}
            </div>
            <div>
              <h3>Approved</h3>
              {!approvedTransactions.length && <div className="empty-state">
                  No transactions
                </div>}
              {approvedTransactions.map((t, idx) => (
                <Transaction key={t.id} {...t} canCancel={false} />
              ))}
            </div>
            <div>
              <h3>Rejected</h3>
              {!rejectedTransactions.length && <div className="empty-state">
                  No transactions
                </div>}
              {rejectedTransactions.map((t, idx) => (
                <Transaction key={t.id} {...t} canCancel={false} />
              ))}
            </div>
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
