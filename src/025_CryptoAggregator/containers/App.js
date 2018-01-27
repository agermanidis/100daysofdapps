import React, { Component } from 'react';
import styled from 'styled-components';
import PostSubmissionForm from './PostSubmissionForm';
import { connect, dispatch } from 'react-redux';
import { createPost, receivePost, receivePosts, upvotePost, downvotePost, changeVote } from '../actions';
import Post from '../components/Post';
import CoinIcon from '../coin.png';
import uuid from 'uuid/v4';
import ReactModal from 'react-modal';

const GAS_LIMIT = 300000;

const timeout = ms => new Promise(res => setTimeout(res, ms))

const Container = styled.div`
  margin: 3em;
`;

const customModalStyle = {
  content: {
    top: "50%",
    left: "50%",
    width: "500px",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    textAlign: 'center'
  }
};

const generateUUID = () => uuid().replace(/-/g, '');

class App extends Component {
  state = {
    showCreate: false,
    receivedPosts: false
  };

  componentDidMount () {
    if (this.props.contract) this.receivePosts();
  }  

  componentWillReceiveProps () {
    if (this.props.contract) this.receivePosts();
  }

  componentDidUpdate () {
    if (this.props.contract) this.receivePosts();
  }
  
  async receivePost (postId) {
    const { dispatch, contract, ethInfo } = this.props;
    const post = await contract.methods.stories(postId).call();
    let vote = 0;
    if (ethInfo.address) {
      vote = parseInt(await contract.methods.getVote(postId, ethInfo.address).call());
    }
    const score = await contract.methods.getScore(postId).call();
    dispatch(receivePost(postId, {
      title: post[0],
      url: post[1],
      author: post[2],
      createdAt: parseInt(post[3])*1000,
      confirmed: true,
      score,
      vote
    }));
  }

  async receivePosts () {
    if (this.state.receivedPosts) return;
    const { contract } = this.props;
    const numberOfStories = await contract.methods.numberOfStories().call();
    let posts = {};
    for (var i = 0; i < numberOfStories; i++) {
      const postId = await contract.methods.storyIds(i).call();
      await this.receivePost(postId);
    }
    this.setState({receivedPosts: true});
  }

  async onVote (postId, upvoted) {
    const { dispatch, ethInfo, contract } = this.props;
    const { web3, network, isNetworkSupported, address } = ethInfo;
    const balance = parseInt(await web3.eth.getBalance(address, 'latest'));
    dispatch(changeVote(postId, upvoted ? 2 : 3, upvoted ? balance : -balance));
    contract.methods.vote(postId, upvoted)
      .send({
        from: address,
        gas: GAS_LIMIT
      })
      .on("transactionHash", async hash => {
        await this.waitForTransaction(hash);
        await this.receivePost(postId);
      });
  }

  async submit (values) {
    const { dispatch, ethInfo, contract } = this.props;
    const { web3, network, isNetworkSupported, address } = ethInfo;
    const { title, url } = values;
    const postId = '0x'+generateUUID();
    this.setState({showCreate: false});
    dispatch(createPost({postId, title, url, score: 0, author: address}));
    contract.methods
      .create(postId, title, url)
      .send({
        from: address,
        gas: GAS_LIMIT
      })
      .on("transactionHash", async hash => {
        await this.waitForTransaction(hash);
        await receivePost(postId);
      });
  }

  async waitForTransaction (tx) {
    const { web3 } = this.props.ethInfo;
    const receipt = await web3.eth.getTransactionReceipt(tx);
    if (receipt === null) {
      await timeout(1000);
      return this.waitForTransaction(tx);
    }
    return receipt.status === "0x1";
  }

  render  () {
    const { showCreate } = this.state;
    const { posts, ethInfo } = this.props;
    const { web3, network, isNetworkSupported } = ethInfo;

    return (
      <Container id='cryptoaggregator'>
        <ReactModal 
          shouldCloseOnOverlayClick={true} 
          style={customModalStyle} 
          onRequestClose={() => this.setState(
            { showCreate: false}
          )} 
          isOpen={showCreate}>
          <h3>Create Post:</h3>
          <PostSubmissionForm 
            onSubmit={this.submit.bind(this)} />
        </ReactModal>
        <img src={CoinIcon} width={150} />
        <h2>CryptoAggregator</h2>
        <h3>A news aggregator hosted on the blockchain.</h3>
        <h3>Your upvoting power is proportional to your balance.</h3>
        <div style={{margin: '1em'}}>
          {Object.keys(posts).map((key, idx) => {
            return <div>              
              <Post 
                key={idx} 
                idx={idx} 
                network={network} 
                web3={web3}
                readOnly={!isNetworkSupported}
                onUpvote={() => this.onVote(key, true)}
                onDownvote={() => this.onVote(key, false)}
                {...posts[key]} />
            </div>;
          })}
        </div>
        <button disabled={!isNetworkSupported} onClick={() => this.setState({showCreate: true})}>
          Create New Post
        </button>
      </Container>
    );
  }
};

function mapStateToProps({posts, ethInfo, contract}) {
    return {
        posts,
        ethInfo,
        contract
    };
}
  

export default connect(mapStateToProps)(App)
