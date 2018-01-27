pragma solidity ^0.4.0;

contract CryptoAggregator {
    enum Vote { 
        NoVote,
        UnVoted,
        UpVote, 
        DownVote
    }
    
    struct Story {
        string title;
        string url;
        address author;
        uint createdAt;
        address[] voters;
        mapping (address => Vote) votes;
    }
    
    string[] public storyIds;
    mapping (string => Story) stories;
    
    function numberOfStories() public view returns (uint) {
        return storyIds.length; 
    }
    
    function vote (string storyId, bool positive) public {
        Story storage story = stories[storyId];
        if (story.votes[msg.sender] == Vote.NoVote)
            story.voters.push(msg.sender);
        if (positive) {
            story.votes[msg.sender] = Vote.UpVote;
        } else {
            story.votes[msg.sender] = Vote.DownVote;
        }
    }
    
    function unvote (string storyId) public {
        Story storage story = stories[storyId];
        require(story.votes[msg.sender] != Vote.NoVote);
        story.votes[msg.sender] = Vote.UnVoted;
    }
    
    function create(string storyId, string title, string url) public {
        stories[storyId].title = title;
        stories[storyId].url = url;
        stories[storyId].author = msg.sender;
        stories[storyId].createdAt = now;
        storyIds.push(storyId);
    }
    
    function getScore (string storyId) public view returns (int256) {
        Story storage story = stories[storyId];
        int256 total = 0;
        for (uint i = 0; i < story.voters.length; i++) {
            Vote v = story.votes[story.voters[i]];
            if (v == Vote.UpVote) {
                total += int256(story.voters[i].balance);
            } else if (v == Vote.DownVote) {
                total -= int256(story.voters[i].balance);
            }
        }
        return total;
    }
}