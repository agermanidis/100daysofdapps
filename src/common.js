import React, { Component } from 'react';
import Web3 from "web3";
import { Link } from "react-router-dom";
import ReactLoading from "react-loading";

class SugarComponent extends Component {
  setStateAsync(state) {
    return new Promise(resolve => {
      this.setState(state, resolve);
    });
  }
}

function getEtherscanAddressUrl(addr, network = 'mainnet') {
  if (network === 'ropsten')  return `https://ropsten.etherscan.io/address/${addr}`;
  return `https://etherscan.io/address/${addr}`;
}

function getEtherscanTxUrl(addr, network = 'mainnet') {
  if (network === 'ropsten')  return `https://ropsten.etherscan.io/tx/${addr}`;
  return `https://etherscan.io/tx/${addr}`;
}

const truncate = addr => {
  return addr.substr(0, 16) + "...";
};

const ExternalLink = ({children, ...rest}) => {
    return <a target='_blank' {...rest}>{children}</a>;
}

const EtherscanTxLink = ({ transaction, truncate, text, network }) => {
    const inner = text || (truncate ? truncate(transaction) : transaction);
    return <ExternalLink href={getEtherscanTxUrl(transaction, network)}>
        {inner}
      </ExternalLink>;
}

const EtherscanAddressLink = ({ address, truncate, text, network }) => {
    const inner = text || (truncate ? truncate(address) : address);
    return <ExternalLink href={getEtherscanAddressUrl(address, network)}>
        {inner}
      </ExternalLink>;
};

const joinOr = (arr) => {
    if (arr.length == 1) return arr[0];
    return arr.slice(0, arr.length - 1).join(', ') + ' or ' + arr.slice(arr.length-1);
}

const WithPendingTransaction = ({transaction, network, children}) => {
    if (transaction) {
        return (<span className="pending-tx">
                Pending confirmation (might take a minute):{" "}
                <EtherscanTxLink network={network} transaction={transaction} />
                <ReactLoading className="loading" type="spin" color="#444" />
              </span>);
    } else {
        return children;
    }
}

const TopBar = ({hasWeb3, network, isNetworkSupported, supportedNetworks, address}) => {
    if (hasWeb3 && isNetworkSupported) {
        return (
            <div className='topbar success'>
                Metamask detected. Connected to {network}.
            </div>
        )
    } else if (hasWeb3) {
        return <div className="topbar fail">
            Metamask detected but current network is not supported for this dapp. Please switch to {joinOr(supportedNetworks)}. This site will be read-only.
          </div>;
    } else {
        return <div className="topbar fail">
            No <a href="https://metamask.io/" target="_blank">
              Metamask extension
            </a> detected.{' '}
            <ExternalLink href="https://www.youtube.com/watch?v=6Gf_kRE4MJU">
              Here are instructions for how to install it.
            </ExternalLink>{' '}
            This site will be read-only.
          </div>;
    }
}

const BackButton = () => {
    return <Link to="/" className="back-button">
        ← Back
      </Link>;
}

class EthereumWrapper extends Component {
  constructor() {
    super();
    this.state = {
      hasWeb3: false,
      network: null
    };
  }

  refreshLatestBlock() {
    const { web3 } = this.state;
    web3.eth.getBlock("latest", (err, block) => {
      this.setState({ blockNumber: block.number });
    });
  }

  async initWeb3(hasWeb3, web3, remoteWeb3) {
    const accounts = await web3.eth.getAccounts();

    const address = accounts[0];

    const netId = await web3.eth.net.getId();
    console.log("NET ID", netId);
    let network = null;
    switch (netId) {
      case 1:
        network = "mainnet";
        break;
      case 2:
        network = "rinkeby";
        break;
      case 3:
        network = "ropsten";
        break;
      default:
        break;
    }

    const isNetworkSupported = hasWeb3 && this.props.supportedNetworks.includes(network);

    this.setState(
      {
        web3: isNetworkSupported ? web3 : remoteWeb3,
        hasWeb3,
        network: isNetworkSupported ? network : this.props.supportedNetworks[0],
        isNetworkSupported,
        address
      },
      () => {
        this.refreshLatestBlock();
      }
    );
  }

  componentDidMount() {
    const REMOTE_WALLET = `https://${this.props.mainNetwork || 'mainnet'}.infura.io/WMJsUBMh7rbJXx3SgYIP`;

    const hasWeb3 = !!window.web3;
    const remoteWeb3 = new Web3(new Web3.providers.HttpProvider(REMOTE_WALLET));
    const web3 = hasWeb3 ? new Web3(window.web3) : remoteWeb3;

    console.log("version:", web3.version);

    this.initWeb3(hasWeb3, web3, remoteWeb3);
  }

  render() {
    console.log(this.props);
    if (!this.state.web3) return <p>Loading...</p>;
    const childrenWithProp = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, this.state);
    });
    return (
      <div>
        <TopBar
          {...this.state}
          supportedNetworks={this.props.supportedNetworks}
        />
        <BackButton />
        {childrenWithProp}
      </div>
    );
  }
}

export {
  truncate,
  BackButton,
  ExternalLink,
  SugarComponent,
  EthereumWrapper,
  getEtherscanAddressUrl,
  getEtherscanTxUrl,
  EtherscanTxLink,
  EtherscanAddressLink,
  WithPendingTransaction
};