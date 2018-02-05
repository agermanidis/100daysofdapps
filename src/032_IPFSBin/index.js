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
import Textarea from "react-expanding-textarea";
import styled from 'styled-components';
import { Route, IndexRoute } from "react-router";
import { HashRouter, Switch, Link } from "react-router-dom";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/styles/hljs";
import languages from './languages';
import PasteIcon from './paste.svg';

const Container = styled.div`
  text-align: center;
  margin: 3em 0;
`;

const StyledInput = styled.input`
  outline: none;
  font-size: 1em;
  text-align: left !important;
  margin: auto 0.25em;
  padding: 0.5em;
  width: 75%;
  text-align: center;
`;

const StyledTextarea = styled.textarea`
  outline: none;
  width: 75%;
  resize: none;
  min-height: 300px;
  padding: 0.5em;
`;

const SmallButton = styled.button`
  margin: 0 1em;
  font-size: 0.9em;
  padding: 0.5em;
`;


class Creator extends SugarComponent {
    state = {
      title: '',
      content: ''
    };

    async createPaste () {
      const { title, content, language } = this.state;
      const ipfsHash = await uploadStringToIpfs(JSON.stringify({title, content, language}));
      this.props.history.push(`/032_IPFSBin/${ipfsHash}`);
    }
    
    render () {
        const { title, content, language } = this.state;
        
        return <Container>
            <p><img src={PasteIcon} width={100} /></p>
            <StyledInput placeholder="title" value={title} onChange={evt => this.setState(
                  {
                    title: evt.target.value
                  }
                )} />
            <StyledTextarea value={content} onChange={evt => this.setState(
                  { content: evt.target.value }
                )} />
            <div>
              <span>Syntax Highlight: </span>
              <select value={language} onChange={evt => this.setState({
                    language: evt.target.value
                  })}>
                {languages.map((lang, idx) => (
                  <option key={idx} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
            <p>
              <SmallButton onClick={this.createPaste.bind(this)}>
                Create Paste
              </SmallButton>
            </p>
          </Container>;
    }
}

class Viewer extends SugarComponent {
  async componentDidMount () {
    try {
      const content = JSON.parse(await ipfsCat(this.props.match.params.id));
      this.setState(content); 
    } catch (e) {}
  }

  render () {
    if (!this.state) return <p>Paste not found.</p>;
    const { title, content, language } = this.state;
    console.log({title, content, language})
    return <Container>
        <h3>{title}</h3>
        <div style={{textAlign: 'left'}}>
        <SyntaxHighlighter language={language === "none" ? undefined : language}>
          {content}
        </SyntaxHighlighter>
        </div>
        <Link to="/032_IPFSBin">Create new paste</Link>
      </Container>;
  }
}

const Wrapped = () => (
  <EthereumWrapper mainNetwork="ropsten" supportedNetworks={["ropsten"]}>
    <HashRouter>
      <Switch>
        <Route exact path="/032_IPFSBin" component={Creator} />
        <Route path="/032_IPFSBin/:id" component={Viewer} />
      </Switch>
    </HashRouter>
  </EthereumWrapper>
);
export default Wrapped;