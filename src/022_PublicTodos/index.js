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
import contractABI from './abi';
import styled from 'styled-components';
import MdPerson from 'react-icons/lib/md/person';
import FaGlobe from 'react-icons/lib/fa/globe';
import { TextInput } from "../styles";
import Blockies from "react-blockies";
import "react-tippy/dist/tippy.css";
import {Tooltip} from 'react-tippy';
import update from 'immutability-helper';

const CONTRACT_ADDRESSES = {
  ropsten: "0x9dc44d1ac1eb06ce952f19818d9ce0ef39ffcb63"
};

const GAS_LIMIT = 300000;

const StyledInput = styled.input`
  border: none;
  outline: none;
  font-size: 1em;
  text-align: center;
  margin: auto 0.25em;
  padding: 0.3em;
`;


const Container = styled.div`
  text-align: center;
  margin: 3em;
`;

const TodoList = styled.div`
    margin: auto;
    border: 1px solid lightgray;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 25px 50px 0 rgba(0, 0, 0, 0.1);
`;

const NoBorderTextInput = styled(TextInput)`

    border: none;
`;

const TodoContainer = styled.div`
  text-align: left;
  padding: 1em;
  font-size: 1.25em;
  border: 1px solid lightgray;
  display: flex;
  align-items: center;

  & > label {
    margin: 0 0.5em;
    flex: 1;
    color: ${props => (props.complete ? "lightgray" : "black")};
    text-decoration: ${props => (props.complete ? "line-through" : "none")};
  }

  & > span {
      margin: 0 1em;
      color: gray;
      font-size: 0.8em;
  }
`;

const SmallButton = styled.button`
  margin: 0 1em;
  font-size: 0.9em;
  padding: 0.5em;
`;


class Todo extends Component {
    state = {
        address: ''
    }

    render () {
        const {
            complete, 
            bounty, 
            description, 
            onMarkComplete,
            onAssign, 
            assignedTo, 
            isNetworkSupported,
            web3,
            pendingTx,
            onTxFinish
        } = this.props;
        const { address } = this.state;
        return <WithPendingTransaction 
            transaction={pendingTx} 
            web3={web3}
            statusMsg=''
            onFinish={onTxFinish}>
            <TodoContainer complete={complete}>
              <input type="checkbox" checked={complete} onChange={!complete && onMarkComplete} /> <label
              >
                {description}
              </label>
              <span>{bounty} ETH</span>
              {assignedTo !== ZERO_ADDRESS ? <Tooltip interactive html={<div>
                      <span>{assignedTo}</span>
                      <div style={{ display: "flex" }}>
                        <AddressInput autoFocus placeholder="Reassign to..." type="text" value={address} onChange={evt => this.setState(
                              { address: evt.target.value }
                            )} />
                        <SmallButton onClick={() => onAssign(address)} disabled={!isNetworkSupported} style={{ color: "white" }}>
                          Assign
                        </SmallButton>
                      </div>
                    </div>}>
                  <Blockies style={{ width: 30, height: 30, border: "none" }} seed={assignedTo} size={15} scale={2} color="#dfe" bgColor="#ffe" spotColor="#abc" />
                </Tooltip> : <Tooltip interactive html={<div style={{ display: "flex" }}>
                      <AddressInput autoFocus placeholder="Assign to..." type="text" value={address} onChange={evt => this.setState(
                            { address: evt.target.value }
                          )} />
                      <SmallButton onClick={() => onAssign(address)} disabled={!isNetworkSupported} style={{ color: "white" }}>
                        Assign
                      </SmallButton>
                    </div>}>
                  <div style={{ border: "1px dashed gray", borderRadius: "50%", width: 25, height: 25 }} />
                </Tooltip>}
            </TodoContainer>
          </WithPendingTransaction>;
    }
}


const StyledNumberInput = styled(StyledInput)`
  width: 100px;
`;

const AddressInput = styled(StyledInput)`
    font-size: 0.75em;
    width: 300px;
    background: none;
    color: white;
`;

const NumberInput = props => {
  return <StyledNumberInput min="0" step="0.1" type="number" {...props} />;
};

class App extends SugarComponent {
  state = {
    description: "",
    bounty: 0,
    todos: [],
    pendingCreateTx: null,
    pendingAssignTxs: {},
    pendingMarkCompleteTxs: {}
  };

  async componentDidMount() {
    const contractInstance = new this.props.web3.eth.Contract(
      contractABI,
      CONTRACT_ADDRESSES[this.props.network]
    );
    await this.setStateAsync({ contractInstance });
    await this.refreshDapp();
  }

  async refreshDapp() {
    const { contractInstance } = this.state;

    const numberOfTodos = await contractInstance.methods.numberOfTodos().call();

    let todos = [];

    for (var i = 0; i < numberOfTodos; i++) {
      const todo = await contractInstance.methods.todos(i).call();
      if (todo[0] !== this.props.address) continue;
      todos.push({
        id: i,
        description: todo[1],
        bounty: this.props.web3.utils.fromWei(todo[2]),
        assignedTo: todo[3],
        complete: todo[4]
      });
    }

    this.setState({ todos });
  }

  async createTodo() {
    const { web3 } = this.props;
    const { contractInstance, description, bounty } = this.state;
    contractInstance.methods
      .createTodo(description)
      .send({
        value: web3.utils.toWei(bounty.toString()),
        from: this.props.address,
        gas: GAS_LIMIT
      })
      .on("transactionHash", hash => {
        this.setState({ pendingCreateTx: hash });
      });
  }

  async markComplete(todoId) {
    const { web3 } = this.props;
    const { contractInstance } = this.state;
    contractInstance.methods
      .markComplete(todoId)
      .send({
        from: this.props.address,
        gas: GAS_LIMIT
      })
      .on("transactionHash", hash => {
            this.setState(update(this.state, {
                pendingMarkCompleteTxs: {
                  [todoId]: { $set: hash }
                }
              }));
      });
  }

  async assignTo(todoId, addr) {
    const { web3 } = this.props;
    const { contractInstance } = this.state;
    contractInstance.methods
      .assign(todoId, addr)
      .send({
        from: this.props.address,
        gas: GAS_LIMIT
      })
      .on("transactionHash", hash => {
            this.setState(update(this.state, {
                pendingAssignTxs: {
                  [todoId]: { $set: hash }
                }
              }));
      });
  }

  render() {
    const {
      description,
      bounty,
      todos,
      pendingCreateTx,
      pendingMarkCompleteTxs,
      pendingAssignTxs
    } = this.state;

    return <Container>
        <p>Maintain a public todo list on the blockchain.</p>
        <p>Add bounties to your todos & assign them to others.</p>
        <div style={{ display: "flex", margin: "auto" }}>
          <TodoList>
            <div>
              <WithPendingTransaction web3={this.props.web3} transaction={pendingCreateTx} pendingMsg="" onFinish={() => {
                  this.setState({ description: "", bounty: 0 });
                  this.refreshDapp();
                }}>
                <NoBorderTextInput autoFocus value={description} onChange={evt => this.setState(
                      { description: evt.target.value }
                    )} style={{ flex: 1 }} placeholder="Create a task" />
                <NumberInput value={bounty} onChange={evt => this.setState({
                      bounty: evt.target.value
                    })} />
                <span>ETH</span>
                <SmallButton onClick={this.createTodo.bind(this)} disabled={!this.props.isNetworkSupported}>
                  Create
                </SmallButton>
              </WithPendingTransaction>
            </div>
            {todos.map((todo, idx) => (
              <Todo
                key={todo.id}
                {...todo}
                web3={this.props.web3}
                pendingTx={
                  pendingMarkCompleteTxs[todo.id] ||
                  pendingAssignTxs[todo.id]
                }
                isNetworkSupported={this.props.isNetworkSupported}
                onMarkComplete={() => {
                  this.markComplete(todo.id);
                }}
                onAssign={addr => {
                  this.assignTo(todo.id, addr);
                }}
                onTxFinish={this.refreshDapp.bind(this)}
              />
            ))}
          </TodoList>
        </div>
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