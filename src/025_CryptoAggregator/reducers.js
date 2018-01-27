import { combineReducers } from 'redux';
import {
  CREATE_POST,
  CHANGE_VOTE,
  RECEIVE_POSTS,
  RECEIVE_POST,
  UPDATE_ETH_INFO,
  UPDATE_CONTRACT
} from './actions';
import { reducer as formReducer } from 'redux-form';
import update from 'immutability-helper';

function posts (state = {}, action) {
    switch(action.type) {
        case RECEIVE_POSTS:
            return action.posts;
        case RECEIVE_POST:
            action.confirmed = true;
            return update(state, {
                [action.postId]: {$set: action.post}
            });
        case CHANGE_VOTE:
            return update(state, {
                [action.postId]: {
                    score: {$apply: (v) => (v || 0) + action.amount},
                    vote: {$set: action.voteType}
                }
            });
        case CREATE_POST:
            return update(state, {
                [action.postId]: {$set: action}
            })
        default:
            return state;
    }
}

const ethInfoReducer = (state = {}, action) => {
    switch(action.type) {
        case UPDATE_ETH_INFO:
            return action.info;
        default:
            return state;
    }
}

const contractReducer = (state = null, action) => {
    switch(action.type) {
        case UPDATE_CONTRACT:
            return action.contract;
        default:
            return state;
    }
}

const rootReducer = combineReducers({
    posts,
    contract: contractReducer,
    ethInfo: ethInfoReducer,
    form: formReducer
});

export default rootReducer;