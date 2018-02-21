pragma solidity ^0.4.18;

contract Chatbot {
   struct Rule {
       string question;
       string response;
   }
   
   Rule[] public rules;
   
   function addRule (string question, string response) public {
       rules.push(Rule({question: question, response: response}));
   }
   
   function numberOfRules () public view returns (uint) {
       return rules.length;
   }
}