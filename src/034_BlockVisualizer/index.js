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
  ZERO_ADDRESS
} from "../common";
import styled from 'styled-components';
import "react-vis/dist/style.css";
import {RadialChart} from 'react-vis';
import ReactLoading from "react-loading";
import assert from 'assert';


const timeout = ms => new Promise(res => setTimeout(res, ms))

const Container = styled.div`
  text-align: center;
  margin: 3em 0;
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

const StyledNumberInput = styled(StyledInput)`
  width: 100px;
`;

const NumberInput = (props) => {
    return <StyledNumberInput min="0" step="1" type="number" {...props} />;
}

const getTransactionType = (tx, receipt) => {
  if (receipt.contractAddress) return 'contract_creation';
  if (tx.input === '0x') return 'ether_transfer';
  else return 'contract_call';
}

class App extends SugarComponent {
    state = {
      blockN: 0,
      totalBlocks: 0,
      block: null,
      loaded: false,
      data: []
    };

    async componentDidMount () {
      const { web3 } = this.props;
      const block = await web3.eth.getBlock('latest');
      this.setState({blockN: block.number, totalBlocks: block.number});
      this.analyzeBlock(block.number);
    }

    async analyzeBlock (blockN) {
      const { web3 } = this.props;
      this.setState({loaded: false});


      let block;
      try {
        block = await web3.eth.getBlock(blockN.toString(), true);
        assert(block !== null);
      } catch (e) {
        // retry
        await timeout(3000);
        block = await web3.eth.getBlock(blockN.toString(), true);
        
      }

      const transactions = block.transactions;
      block.receipts = [];
      
      let gasPerType = {
        contract_creation: new web3.utils.BN('0'),
        ether_transfer: new web3.utils.BN('0'),
        contract_call: new web3.utils.BN('0')
      };

      let numberOfTxsPerType = {
        contract_creation: 0,
        ether_transfer: 0,
        contract_call: 0
      };

      for (var j = 0; j < transactions.length; j++) {
          const tx = transactions[j];
          const receipt = await this.props.web3.eth.getTransactionReceipt(transactions[j].hash);
          const type = getTransactionType(tx, receipt);
          numberOfTxsPerType[type] += 1;
          console.log(receipt.cumulativeGasUsed, type, gasPerType);
          gasPerType[type] = gasPerType[type].add(new web3.utils.BN(receipt.cumulativeGasUsed));
          block.receipts.push(receipt);
      }

      gasPerType = {
        contract_creation: gasPerType.contract_creation.toNumber(),
        ether_transfer: gasPerType.ether_transfer.toNumber(),
        contract_call: gasPerType.contract_call.toNumber()
      };

      const data = [
        // {
        //   angle: numberOfTxsPerType.contract_creation,
        //   radius: gasPerType.contract_creation,
        //   label: 'Contract Creation'
        // },
        {
          angle: numberOfTxsPerType.ether_transfer,
          radius: gasPerType.ether_transfer,
          label: 'Ether Transfer'
        },
        // {
        //   angle: numberOfTxsPerType.payable_contract_call,
        //   radius: gasPerType.payable_contract_call,
        //   label: 'Payable Contract Call'
        // },
        {
          angle: numberOfTxsPerType.contract_call,
          radius: gasPerType.contract_call,
          label: 'Contract Call'
        }
      ];

      this.setState({ data, loaded: true });
     
    }

    render () {
      const { data, blockN, loaded } = this.state;
      return <Container>
          <h2>Block Visualizer</h2>
          <p>Visualize block #<NumberInput 
            value={blockN} 
            onChange={(evt) => {
              this.setState({blockN: evt.target.value});
              this.analyzeBlock(evt.target.value);
            }}/></p>
          {!loaded && <ReactLoading className="loading" type="spin" color="#444" />}
          {loaded && <div>
          <RadialChart
            showLabels={true}
            data={data}
            width={500}
            height={500} /> 
          </div>}
          <p>Slice of pie is proportional to the % of transactions of a given type.</p>
          <p>Radius of slice is proportional to the cumulative gas expended for transactions of a given type.</p>
        </Container>;
    }
}

const Wrapped = () => (
    <EthereumWrapper
      mainNetwork="mainnet"
      supportedNetworks={['mainnet']}
    >
    <App/>
    </EthereumWrapper>
  );
  export default Wrapped;
  