import React, { Component } from 'react';
import {
    ExternalLink,
    EtherscanAddressLink,
    ZERO_ADDRESS
} from '../../common';
import FaArrowCircleUp from 'react-icons/lib/fa/arrow-circle-up';
import FaArrowCircleDown from 'react-icons/lib/fa/arrow-circle-down';
import styled from 'styled-components';
import moment from 'moment';

const PostContainer = styled.div`
    display: flex;
    align-items: center;
    font-size: 1.25em;
    margin: 0.5em;
    opacity: ${props => props.confirmed ? 1 : 0.75};
    & > div {
        margin: 0 0.5em;
    }
`;

const ScoreContainer = styled.div`
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    min-width: 75px;
    & > * {
        margin: 0.1em 0;
    }
`;

const ScoreText = styled.span`
    font-weight: bold;
    font-size: 0.7em;
`;

const LightGraySpan = styled.span`
    color: lightgray;
    font-size: 0.8em;
`;

const PostContent = styled.div`
    display: flex;
    flex-direction: column;
    text-align: left;
`;

const truncateStr = (n) => {
    if (n.includes('.')) return n.split('.')[0] + '.' + n.split('.')[1].slice(0, 2);
    else return n;
}

export default ({
    score = 0, 
    title, 
    url, 
    idx, 
    createdAt, 
    author, 
    onUpvote, 
    onDownvote, 
    confirmed, 
    readOnly,
    vote,
    web3}) => {
    const noOp = () => {}
    let hostname;
    try {
        hostname = new URL(url).hostname;
    } catch(e) {
        hostname = 'unknown domain';
    }
    return <PostContainer confirmed={confirmed}>
        <LightGraySpan>{idx+1}.</LightGraySpan>
        <ScoreContainer>
            <FaArrowCircleUp 
                style={{
                    cursor: readOnly ? 'default' : 'pointer',
                    color: vote === 2 ? 'orange' : 'black'
                }} 
                onClick={readOnly ? noOp : onUpvote} />
            <ScoreText>{truncateStr(web3.utils.fromWei(score.toString()))} ETH</ScoreText>
            <FaArrowCircleDown 
                style={{
                    cursor: readOnly ? 'default' : 'pointer',
                    color: vote === 3 ? 'orange' : 'black'
                }} 
                onClick={readOnly ? noOp : onDownvote} />
        </ScoreContainer>
        <PostContent>
            <div>
            <ExternalLink href={url}>{title}</ExternalLink>
            {'  '}
            <span style={{color: 'gray', fontSize: '0.9em'}}>({hostname})</span>
            </div>
            <LightGraySpan>
                {!confirmed
                ? 'confirming...'
                : <span>submitted {moment(createdAt).fromNow()} ago by <EtherscanAddressLink address={author} /></span>
                }
            </LightGraySpan>
        </PostContent>
    </PostContainer>
};
