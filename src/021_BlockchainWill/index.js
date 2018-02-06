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
import contractABI from "./abi";
import erc20ContractABI from './erc20_abi';
import WillIcon from './willicon.jpg';
import styled from "styled-components";
import FaPlus from 'react-icons/lib/fa/plus';
import FaCheck from 'react-icons/lib/fa/check';
import moment from 'moment';

const CONTRACT_ADDRESSES = {
  ropsten: "0x0673d9cdd2dab942d5a4efec44e3b557090fbba7"
};

const TOKEN_ADDRESSES = {
  WETH: "0xb0443986C9b33a5e3602217AC0e3Fb7A4D44aE4f"
};

const GAS_LIMIT = 300000;

const Container = styled.div`
  margin: 3em;
`;

const SmallButton = styled.button`
  margin: 0 1em;
  font-size: 0.9em;
  padding: 0.5em;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  & > div {
      margin: 1em;
  }
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

const StyledSelect = styled.select`
  font-size: 1em;
`

const AddressInput = styled(StyledInput)`
  width: 550px;
`;

const StyledNumberInput = styled(StyledInput)`
  width: 100px;
`;

const NumberInput = (props) => {
    return <StyledNumberInput min="0" step="0.1" type="number" {...props} />;
}

const lookupToken = (address) => {
    const knownTokens = Object.keys(TOKEN_ADDRESSES);
    for (var i = 0; i < knownTokens.length; i++) {
        if (address === TOKEN_ADDRESSES[knownTokens[i]]) {
            return knownTokens[i];
        }
    }
}

class App extends SugarComponent {
    constructor () {
        super();
        this.state = {
            amount: 0,
            token: 'WETH',
            beneficiary: '',
            properties: [],
            tokenBalances: {
                WETH: 0
            },
            lastCheckIn: 0,
            pendingAddTx: null,
            pendingCheckInTx: null,
            pendingDepositTx: null
        };
    }

    async refreshDapp () {
        const {address} = this.props;
        const {contractInstance} = this.state;

        const lastCheckIn = await contractInstance.methods.getLastCheckIn().call({from: address});
        const numberOfProperties = await contractInstance.methods.numberOfProperties().call({from: address});

        let properties = [];
        for (var i = 0; i < numberOfProperties; i++) {
            const property = await contractInstance.methods.properties(address, i).call({from: address});
            properties.push({
                beneficiary: property[0],
                token: lookupToken(property[1]),
                amount: property[2]
            })
        }

        console.log({properties});
        this.setState({lastCheckIn, properties});
    }

    async checkIn () {
        const { contractInstance } = this.state;
        contractInstance.methods
          .checkIn()
          .send({
            from: this.props.address,
            gas: GAS_LIMIT
          })
          .on("transactionHash", hash => {
            this.setState({ pendingCheckInTx: hash });
          });
    }

    async addToWill () {
        const { web3 } = this.props;
        const { contractInstance, beneficiary, token, amount } = this.state;
        const tokenAddress = TOKEN_ADDRESSES[token];
        if (!tokenAddress) return;
        contractInstance.methods
          .addToWill(beneficiary, tokenAddress, web3.utils.toWei(amount))
          .send({
            from: this.props.address,
            gas: GAS_LIMIT
          })
          .on("transactionHash", hash => {
            this.setState({ pendingAddTx: hash });
          });
    }

    async depositWETH (amount) {
        const { web3 } = this.props;
        const { contractInstanceWETH } = this.state;
        contractInstanceWETH.methods
          .deposit()
          .send({ 
              value: web3.utils.toWei(amount),
              from: this.props.address, 
              gas: GAS_LIMIT 
          })
          .on("transactionHash", hash => {
            this.setState({ pendingTx: hash });
          });

    }

    async componentDidMount () {
        const contractInstance = new this.props.web3.eth.Contract(
            contractABI,
            CONTRACT_ADDRESSES[this.props.network]
        );
        const contractInstanceWETH = new this.props.web3.eth.Contract(
            erc20ContractABI,
            TOKEN_ADDRESSES.WETH
        );
        await this.setStateAsync({ contractInstance, contractInstanceWETH });
        await this.refreshDapp();
    }

    render () {
        const { 
            amount,
            token, 
            tokenBalances, 
            beneficiary, 
            lastCheckIn, 
            properties,
            pendingAddTx,
            pendingCheckInTx
        } = this.state;
        return <Container>
            <img src={WillIcon} width={200} />
            <h1>Blockchain Will</h1>
            <p>
              Write a will and testament for passing on your
              crypto-tokens.
            </p>
            <p>
              An autonomous smart contract is responsible for carrying
              out your will, guaranteeing complete execution.
            </p>
            <h2>Your Will</h2>
            {properties.map((p, idx) => (
                <p key={idx}>{idx+1}. Pass on <b>{this.props.web3.utils.fromWei(p.amount)} {p.token}</b> to <b>{p.beneficiary}</b>.</p>
            ))}
            <p>
              {properties.length + 1}. Pass on <NumberInput value={amount} onChange={evt => this.setState(
                    { amount: evt.target.value }
                  )} />
              <StyledSelect value={token} onChange={evt => this.setState(
                    { token: evt.target.value }
                  )}>
                {Object.keys(tokenBalances).map(token => (
                  <option key={token} value={token}>
                    {token}
                  </option>
                ))}
              </StyledSelect> to <AddressInput placeholder="beneficiary address" value={beneficiary} onChange={evt => this.setState(
                    { beneficiary: evt.target.value }
                  )} />.
              <WithPendingTransaction web3={this.props.web3} transaction={pendingAddTx}>
                <SmallButton onClick={this.addToWill.bind(this)} disabled={!this.props.isNetworkSupported}>
                  <FaPlus /> Add to Will
                </SmallButton>
              </WithPendingTransaction>
            </p>
            <h2>Token Balances</h2>
            <p>
              0 WETH
              {/* <SmallButton onClick={this.depositWETH.bind(this)} disabled={!this.props.isNetworkSupported}>
              Deposit WETH
              </SmallButton> */}
            </p>
            <h2>Periodic Check In</h2>
            <p>
              You need to check in at least once a year to prevent your
              will from being executed.
            </p>
            <WithPendingTransaction web3={this.props.web3} transaction={pendingCheckInTx}>
              <button onClick={this.checkIn.bind(this)} disabled={!this.props.isNetworkSupported}>
                <FaCheck /> Check In
              </button>
            </WithPendingTransaction>
            <p />
            <div>
              Last check-in was{" "}
              {moment(parseInt(lastCheckIn) * 1000).fromNow()}.
            </div>
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
    <App />
  </EthereumWrapper>
);
export default Wrapped;