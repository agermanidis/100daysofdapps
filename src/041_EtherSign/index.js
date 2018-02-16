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
import moment from 'moment';
import Textarea from 'react-expanding-textarea';
import SignatureIcon from './signature.png';

const Container = styled.div`
  text-align: center;
  margin: 3em 0;
  & p {
      margin: 1em auto;
      width: 50%;
  }
`;

const SmallButton = styled.button`
  margin: 0 1em;
  font-size: 0.9em;
  padding: 0.5em;
`;

const StyledTextarea = styled(Textarea)`
  width: 50%;
  outline: none;
  height: 50px;
  resize: none;
  min-height: 200px;
  margin: 0;
  padding: 10px;
`;


class App extends SugarComponent {
    state = {
        msg: '',
        result: ''
    };

    async sign () {
        const { address, web3 } = this.props;
        const { msg } = this.state;
        const result = await web3.eth.personal.sign(msg, address);
        this.setState({result});
    }    

    render () {
        const { msg, result } = this.state;
        return <Container>
            <img src={SignatureIcon} width={100} />
            <h1>EtherSign</h1>
            <p>Quickly sign a message using your Ethereum private key.</p>
            <div>
            <StyledTextarea value={msg} onChange={evt => {
                this.setState({ msg: evt.target.value });
              }} placeholder="Type a message..." />
            </div>
            <p>
                <SmallButton onClick={this.sign.bind(this)}>
                Sign Message
                </SmallButton>
            </p>
                {result && <div>
                    <p><b>Signature:</b></p>
                    <p>{result}</p>
                    </div>}
            </Container>
    }
}

const Wrapped = () => (
    <EthereumWrapper
      mainNetwork="ropsten"
      supportedNetworks={['mainnet', 'ropsten']}
    >
    <App/>
    </EthereumWrapper>
  );
  export default Wrapped;
  
