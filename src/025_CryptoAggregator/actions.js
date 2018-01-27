/*
 * action types
 */

export const CREATE_POST = 'CREATE_POST'
export const CHANGE_VOTE = 'CHANGE_VOTE'
export const RECEIVE_POST = 'RECEIVE_POST'
export const RECEIVE_POSTS = 'RECEIVE_POSTS'
export const UPDATE_ETH_INFO = 'UPDATE_ETH_INFO';
export const UPDATE_CONTRACT = 'UPDATE_CONTRACT';

/*
 * action creators
 */

export function createPost({postId, title, url, confirmed = false}) {
  return { type: CREATE_POST, postId, title, url, confirmed }
}

export function changeVote(postId, voteType, amount) {
  return { type: CHANGE_VOTE, postId, amount, voteType}
}

export function receivePosts (posts) {
  return { type: RECEIVE_POSTS, posts };
}

export function receivePost (postId, post) {
  return { type: RECEIVE_POST, postId, post };
}

export function updateEthInfo (info) {
  return { type: UPDATE_ETH_INFO, info };
}

export function updateContract (contract) {
  return { type: UPDATE_CONTRACT, contract };
}