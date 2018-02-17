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
import styled from "styled-components";
import { Route, IndexRoute } from "react-router";
import { HashRouter, Switch, Link } from "react-router-dom";
import Dropzone from "react-dropzone";
import FaFileO from "react-icons/lib/fa/file-o";
import sjcl from 'sjcl';
import FileSaver from 'file-saver';

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


class Uploader extends SugarComponent {
  state = {
    password: '',
    filename: '',
    content: '',
  };

  async onDrop (files) {
    if (files.length === 0 ) return;
    const file = files[0];
    this.setState({filename: file.name});
    let reader = new FileReader();
    reader.onloadend = () => {
      this.setState({content: reader.result})
    };
    reader.readAsBinaryString(file);
  }

  async upload () {
    const { password, content, filename } = this.state;
    const encrypted = sjcl.encrypt(password, content);
    const ipfsHash = await uploadStringToIpfs(JSON.stringify({encrypted, filename}));
    this.props.history.push(`/045_DStorage/${ipfsHash}`);
  }

  render () {
    const { filename, password } = this.state;

    return <Container>
        <h1>Decentralized Storage</h1>
        <p>Store password-protected files on the IPFS network.</p>
        {filename ? <p>
            <FaFileO /> { filename }
          </p> : <center>
            <Dropzone className="bw-dropzone" onDrop={this.onDrop.bind(this)}>
              <p>
                <FaFileO /> Drop any file
              </p>
            </Dropzone>
          </center>}
        <br />
        <div>
          <StyledInput type="password" placeholder="Password" value={password} onChange={evt => this.setState(
                { password: evt.target.value }
              )} />
        </div>
        <p>
          <SmallButton 
            onClick={this.upload.bind(this)}
            disabled={!filename || !password}
            >Upload</SmallButton>
        </p>
      </Container>;
  }
}

class Viewer extends SugarComponent {
  state = {
    filename: "",
    password: "",
    encrypted: ""
  };

  async componentDidMount() {
    try {
      const {encrypted, filename} = JSON.parse(await ipfsCat(this.props.match.params.id));
      this.setState({encrypted, filename});
    } catch (e) {}
  }

  async download () {
    const { password, encrypted, filename } = this.state;
    const data = sjcl.decrypt(password, encrypted);
    const file = new File([data], filename);
    FileSaver.saveAs(file);
  }

  render() {
    const { password } = this.state;
    return (
      <Container>
        <h1>Decentralized Storage</h1>
        <p>Please enter the password for this file:</p>
        <div>
          <StyledInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={evt => this.setState({ password: evt.target.value })}
          />
        </div>
        <p>
          <SmallButton disabled={!this.state.password} onClick={this.download.bind(this)}>
            Download
          </SmallButton>
        </p>
        <a href='#/045_DStorage'>Back to Upload</a>
      </Container>
    );
  }
}

const Wrapped = () => (
  <EthereumWrapper mainNetwork="ropsten" supportedNetworks={["ropsten"]}>
    <HashRouter>
      <Switch>
        <Route exact path="/045_DStorage" component={Uploader} />
        <Route path="/045_DStorage/:id" component={Viewer} />
      </Switch>
    </HashRouter>
  </EthereumWrapper>
);
export default Wrapped;