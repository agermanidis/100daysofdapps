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
import styled from 'styled-components';
import update from 'immutability-helper';
import { sha256 } from 'js-sha256';

const Container = styled.div`
  text-align: center;
  display: flex;
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

const Blockchain = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  flex-direction: column;
  height: 90vh;
  overflow: scroll;
`;

const BalancesContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const BalancesTable = styled.table`
`;

const BlockStyle = styled.div`
  margin: 1em;
  padding: 1em;
  border: 1px solid gray;
  border-radius: 5px;
`;

const AddBlockButton = styled.button`
  width: 50px;
  height: 50px;
`;

const BalancesTableCell = styled.td`
  border: 1px solid gray;
`;

const newBlock = (parent) => {
  const parentHash = parent ? hashBlock(parent) : '00000000000000000000000000000000';
  return {
    parentHash,
    difficulty: 2,
    transactions: [],
    nonce: 0
  };
}

const hashTx = (tx) => {
  return sha256(JSON.stringify(tx));
}

const hashBlock = (block) => {
  return sha256(
    block.parentHash + 
    block.difficulty +
    block.transactions.map(hashTx).join('') + 
    block.nonce
  );
}

const verifyBlock = (block) => {
  const h = hashBlock(block);
  for (var i = 0; i < block.difficulty; i++) {
    if (h[i] !== '0') return false;
  }
  return true;
}

const getBalances = (blocks) => {
  let balances = {};
  for (var block of blocks) {
    for (var tx of block.transactions) {
      if (tx.type === 'mint') {
        balances[tx.to] = (balances[tx.to] || 0) + tx.value;
      } else {
        balances[tx.from] = (balances[tx.from] || 0) - tx.value;
        balances[tx.to] = (balances[tx.to] || 0) + tx.value;
      }
    }
  }
  return balances;
}

const verifyBalances = (balances) => {
  for (var key of Object.keys(balances)) {
    if (balances[key] < 0) return false;
  }
  return true;
}

class Block extends Component {
  async mine () {
    let { block, difficulty } = this.props;
    block = JSON.parse(JSON.stringify(block));
    let nonce = 0;
    while (true) {
        const hash = hashBlock(block);
        if (verifyBlock(block)) {
            break;
        }
        block.nonce += 1;
    }
    this.props.onChange('nonce', block.nonce);
  }

  render () {
    const {idx, hash, parentHash, difficulty, transactions, nonce, onChange, mined, txVerified} = this.props;
    
    return <div><BlockStyle>
    <h2>Block #{idx}</h2>
    <div>Parent Hash: <input value={parentHash} /></div>
    <div>Difficulty: <input style={{width: 50}} type='number' value={difficulty} onChange={(evt) => onChange('difficulty', evt.target.value)}/></div>
    <div style={{border: '1px solid gray', padding: '1em'}}>
      {transactions.map((tx, idx) => <div key={idx} style={{margin: '0.5em'}}>
      <select value={tx.type} onChange={(evt) => {
        onChange('transactions', update(transactions, {
          [idx]: {type: {$set: evt.target.value}, from: {$set: tx.from || 'Alice'}}
        }))
      }}>
        <option value='transfer'>Transfer</option>
        <option value='mint'>Mint</option>
      </select> 
      {' '}
      <input placeholder='value' type='number' style={{width: 50}} value={tx.value} onChange={(evt) => {
        onChange('transactions', update(transactions, {
          [idx]: {value: {$set: parseInt(evt.target.value)}}
        }))}}/> coins
      {' '}
      {tx.type === 'transfer' 
        ? <span>from <input placeholder='sender' style={{width: 75}} value={tx.from} onChange={(evt) => {
          onChange('transactions', update(transactions, {
            [idx]: {from: {$set: evt.target.value}}
          }))}}/>
          {' '}to <input placeholder='recipient' style={{width: 75}} value={tx.to} onChange={(evt) => {
        onChange('transactions', update(transactions, {
          [idx]: {to: {$set: evt.target.value}}
        }))}}/></span>
        : <span>and send to <input placeholder='recipient' style={{width: 75}} value={tx.to} onChange={(evt) => {
          onChange('transactions', update(transactions, {
            [idx]: {to: {$set: evt.target.value}}
          }))}}/></span>}
        <SmallButton onClick={() => {
          onChange('transactions', update(transactions, {
            $splice: [[idx, 1]]
          }));
        }}>-</SmallButton>
      </div>)}
    <SmallButton onClick={() => {
      const newTx = {type: 'mint', value: 0, to: 'Bob'};
      onChange('transactions', transactions.concat([newTx]))
    }}>
      Add Tx
    </SmallButton>
    </div>
    <div>Nonce: <input style={{width: 100}} type='number' value={nonce} /></div>
    <div style={{color: 'gray', margin:'1em'}}>{hash}</div>
  </BlockStyle>
  {!txVerified && <div style={{color:'red'}}>Transactions are invalid.</div>}
  {txVerified && !mined && 
  <div>
    <div style={{color:'red'}}>This block has not been mined.</div>
    <br/>
    <SmallButton onClick={this.mine.bind(this)}>Mine</SmallButton>
  </div>}
  </div>
  }
}

class App extends SugarComponent {
  state = {
    blocks: [newBlock()],
    error: ''
  };

  render () {
    const { blocks } = this.state;
    const lastBlock = blocks.slice(-1)[0];
    const balances = getBalances(blocks);
    return <Container>
      <Blockchain>
        {blocks.map((block, idx) => (
          <Block 
            key={idx} 
            idx={idx} 
            hash={hashBlock(block)}
            block={block}
            mined={verifyBlock(block)}
            txVerified={verifyBalances(balances)}
            onChange={(key, value) => {
              if (block !== lastBlock) return;
              this.setState(update(this.state, {
                blocks: {[idx]: {[key]: {$set: value}}}
              }))
            }}
            {...block} />
        ))}
        {verifyBlock(lastBlock) && <AddBlockButton onClick={() => {
          this.setState(update(this.state, {blocks: {$push: [newBlock(lastBlock)]}}))
        }}>
        +
      </AddBlockButton>}
      </Blockchain>
      <BalancesContainer>
      <h3>Balances</h3>
      <BalancesTable>
        <tr>
         <th>Name</th>
         <th>Balance</th>
        </tr>
        <br />
        <tbody>
        {Object.keys(balances).map((key, idx) => {
           return <tr key={key}>
              <BalancesTableCell>{key}</BalancesTableCell>
              <BalancesTableCell>{balances[key]}</BalancesTableCell>
            </tr>;
         })}
         </tbody>
       </BalancesTable>
      </BalancesContainer>
    </Container>;
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
  