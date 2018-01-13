pragma solidity ^0.4.0;

contract BackgroundColorDemocracy {
    uint timeForDebate = 5 minutes;
    Proposal[] proposals;
    Color defaultColor = Color(255, 255, 255);
    
    struct Color {
        uint r;
        uint g;
        uint b;
    }
    
    struct Proposal {
        Color proposedColor;
        uint votingDeadline;
        uint yayVotes;
        uint nayVotes;
        mapping (address => bool) voted;
    }
    
    function propose (uint _r, uint _g, uint _b) public {
        require(verifyColor(_r, _g, _b));
        proposals.push(Proposal(Color(_r, _g, _b), now + timeForDebate, 0, 0));
    }
    
    function vote (uint _proposalId, bool _supportsProposal) public {
        require(_proposalId < proposals.length);
        Proposal storage p = proposals[_proposalId];
        require(!proposalExpired(p));
        require(!p.voted[msg.sender]);
        if (_supportsProposal) {
            p.yayVotes += 1;
        } else {
            p.nayVotes += 1;
        }
        p.voted[msg.sender] = true;
    }
    
    function verifyColor (uint r, uint g, uint b) private pure returns (bool) {
        return r <= 255 && g <= 255 && b <= 255;
    }
    
    function proposalExpired(Proposal p) private view returns (bool) {
        return now > p.votingDeadline;
    }
    
    function proposalPassed(Proposal p) private view returns (bool) {
        return p.yayVotes > p.nayVotes && proposalExpired(p);
    }
    
    function currentColor () public view returns (uint, uint, uint) {
        Color memory latestColor = defaultColor;
        for (uint i = 0; i < proposals.length; i++) {
            if (proposalPassed(proposals[i])) {
                latestColor = proposals[i].proposedColor;
            }
        }
        return (latestColor.r, latestColor.g, latestColor.b);
    }
    
    function getProposal (uint _proposalId) public view returns (uint, uint, uint, uint, uint, uint, bool) {
        require(_proposalId < proposals.length);
        Proposal storage p = proposals[_proposalId];
        Color storage c = p.proposedColor;
        return (c.r, c.g, c.b, p.yayVotes, p.nayVotes, p.votingDeadline, p.voted[msg.sender]);
    }
    
    function numberOfProposals () public view returns (uint) {
        return proposals.length;
    }
}