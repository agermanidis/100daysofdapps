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
  uploadFileToIpfs,
  uploadStringToIpfs,
  ipfsCat,
  ipfsURL
} from "../common";
import contractABI from "./abi";
import profileContractABI from "./profile_abi";
import FaFileImageO from 'react-icons/lib/fa/file-image-o';
import Dropzone from "react-dropzone";
import Textarea from 'react-expanding-textarea';
import moment from 'moment';
import './index.css';
import Blockies from 'react-blockies';


const CONTRACT_ADDRESSES = {
  ropsten: "0x72045e607fffe402c95470718a4fac68b5baa2ca"
};

const CONTRACT_ADDRESSES_PROFILE = {
  ropsten: "0x165d9e99f23ab2ab039e92eb536f9a191663182d"
};

const GAS_LIMIT = 300000;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const Status = ({message, network, author, time, image, nickname, picture}) => {
    return <div className='status'>
            {picture 
            ? <img className='picture' src={picture} />
            :<Blockies 
                seed={author} 
                size={15}
                scale={3}
                color="#dfe"
                bgColor="#ffe"
                spotColor="#abc"
                />}
            <div>
            <div className='author'>
                <b className='nickname'>{nickname || 'Anonymous'}</b>
                <EtherscanAddressLink address={author} network={network} />
            </div>
            <div className='message'>{message}</div>
            {image && <ExternalLink href={ipfsURL(image)}><img className='image' src={ipfsURL(image)}/></ExternalLink>}
            <div className='time'>{moment(parseInt(time)*1000).fromNow()}</div>
            </div>
        </div>;
}

class App extends SugarComponent {
    constructor () {
        super();
        this.state = {
            image: '',
            msg: '',
            pendingTx: null,
            statuses: []
        };
    }

    async refreshDapp() {
        const { contractInstance } = this.state;
        const { address } = this.props;

        const count = await contractInstance.methods
            .numberOfStatuses()
            .call();

        let statuses = [];
        for (var i = count - 1; i >= 0; i--) {
            const result = await contractInstance.methods
                .statuses(i)
                .call();
            const author = result[0];
            const timestamp = result[1];
            const content = JSON.parse(await ipfsCat(result[2]));
            const profile = await this.getProfile(author);
            console.log(profile);
            statuses.push({
                author,
                timestamp,
                content,
                nickname: profile.nickname,
                picture: profile.picture
            });
        }
        
        console.log(statuses);
        await this.setStateAsync({ statuses });
    }
    
   async componentDidMount() {
        const contractInstance = new this.props.web3.eth.Contract(
            contractABI,
            CONTRACT_ADDRESSES[this.props.network]
        );
        const profileContractInstance = new this.props.web3.eth.Contract(
            profileContractABI,
            CONTRACT_ADDRESSES_PROFILE[this.props.network]
        );
        await this.setStateAsync({ contractInstance, profileContractInstance });
        await this.refreshDapp();
    }

    async onDrop (files) {
        if (files.length === 0) return;

        const { address, web3 } = this.props;
        const { contractInstance } = this.state;

        await this.setStateAsync({
          image: URL.createObjectURL(files[0]),
          imageFile: files[0]
        });
    }

    async broadcast () {
        const { address } = this.props;
        const { contractInstance, msg, imageFile } = this.state;

        const status = {
            message: msg,
            imageHash: imageFile && await uploadFileToIpfs(imageFile)
        };
        
        const statusHash = await uploadStringToIpfs(JSON.stringify(status));

        contractInstance.methods
            .setStatus(statusHash)
            .send({ from: address, gas: GAS_LIMIT }).on("transactionHash", hash => {
              this.setState({ pendingTx: hash });
            });
    }

    async getProfile (address) {
        const { profileContractInstance } = this.state;
        const result = await profileContractInstance.methods.getInfo(address).call();
        if (result[0]) {
            return {
                nickname: result[0],
                picture: ipfsURL(result[1])
            }
        } else {
            return {};
        }
    }

    render () {
        const { msg, image, pendingTx, statuses } = this.state;
        return <div id='su-main'>
            <div id='input-container'>
                <div id='input-container-box'>
                <Textarea 
                    maxLength="300" 
                    value={msg}
                    onChange={(evt) => {this.setState({msg: evt.target.value})}}
                    ref={(input)=>this.input = input} 
                    placeholder=" What's happening?" />
                <span className='msg-limit'>{msg.length}/300</span>
                <Dropzone className='img-drop' accept="image/*" onDrop={this.onDrop.bind(this)}>
                    <FaFileImageO />
                </Dropzone>
                </div>
                { image && <img src={image} /> }
            </div>
            <WithPendingTransaction
                web3={this.props.web3}
                transaction={pendingTx}
                successMsg='Broadcast succeded.'
                onFinish={() => {this.setState({msg: '', image: '', imageFile: null}); this.refreshDapp();}}>
            <button
                onClick={this.broadcast.bind(this)}
                disabled={!this.props.isNetworkSupported}
              >📣 Broadcast</button>
            </WithPendingTransaction>
            <p>Recent broadcasts</p>
            <div id='statuses'>
                {statuses.map((status, idx) => {
                    return (
                        <Status 
                            key={idx}
                            network={this.props.network}
                            author={status.author}
                            time={status.timestamp}
                            message={status.content.message}
                            image={status.content.imageHash}
                            nickname={status.nickname}
                            picture={status.picture}
                             />
                    );
                })}
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
