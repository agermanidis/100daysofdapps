import React, { Component } from 'react';
import Web3 from "web3";
import { Link } from "react-router-dom";

class SugarComponent extends Component {
  setStateAsync(state) {
    return new Promise(resolve => {
      this.setState(state, resolve);
    });
  }
}

function getEtherscanAddressUrl(addr) {
  return `https://etherscan.io/address/${addr}`;
}

function getEtherscanTxUrl(addr) {
  return `https://etherscan.io/tx/${addr}`;
}

const truncate = addr => {
  return addr.substr(0, 16) + "...";
};

const ExternalLink = ({children, ...rest}) => {
    return <a target='_blank' {...rest}>{children}</a>;
}

const TopBar = ({hasWeb3, network, address}) => {
    if (hasWeb3 && network === 'mainnet') {
        return (
            <div className='topbar success'>
                Metamask detected. Connected to {network}.
            </div>
        )
    } else if (hasWeb3) {
        return <div className="topbar fail">
            Metamask detected but network is not mainnet. Please switch to mainnet. This site will be read-only.
          </div>;
    } else {
        return <div className="topbar fail">
            No <a href="https://metamask.io/" target="_blank">
              Metamask extension
            </a> detected. This site will be read-only.
          </div>;
    }
}

const BackButton = () => {
    return <Link to="/" className="back-button">
        ← Back to index
      </Link>;
}

class EthereumWrapper extends Component {
  constructor () {
    super();
    this.state = {
        hasWeb3: false,
        network: null
    };
  }

  refreshLatestBlock () {
    const {web3} = this.state;
    web3.eth.getBlock('latest', (err, block) => {
      this.setState({ blockNumber: block.number });
    });
  }

  async initWeb3 () {
    const {hasWeb3, web3} = this.state;

    const accounts = await web3.eth.getAccounts();

    this.setState({ address: accounts[0] });
    this.refreshLatestBlock();

    const netId = await web3.eth.net.getId();
    switch (netId) {
      case 1:
        this.setState({ network: "mainnet" });
        break;
      case 2:
        this.setState({ network: "rinkeby" });
        break;
      case 3:
        this.setState({ network: "ropsten" });
        break;
      default:
        break;
    }
  }

  componentDidMount() {
      const REMOTE_WALLET = "https://mainnet.infura.io/WMJsUBMh7rbJXx3SgYIP";

      const hasWeb3 = !!window.web3;
      const web3 = hasWeb3 ? new Web3(window.web3) : new Web3(
          new Web3.providers.HttpProvider(REMOTE_WALLET));

      console.log("version:", web3.version);

      this.setState({
          hasWeb3,
          web3
      }, () => {
        this.initWeb3();
      });

  }

  render() {
    if (!this.state.web3) return <p>Loading...</p>
    const childrenWithProp = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, this.state);
    });
    return <div>
        <TopBar {...this.state}/>
        {childrenWithProp}
    </div>
  }
}

export { 
    truncate,
    BackButton,
    ExternalLink,
    SugarComponent,
    EthereumWrapper, 
    getEtherscanAddressUrl, 
    getEtherscanTxUrl    
};