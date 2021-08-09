pragma solidity ^0.5.16;

import "./Migrations.sol";

contract Admin {
    address public owner = msg.sender;

    modifier restricted() {
        require(
            msg.sender == owner,
            "This function is restricted to the contract's owner"
        );
        _;
    }

    constructor() public {
        owner = msg.sender;
    }

    function deposit() restricted external payable {}

    function withdraw(uint amount) restricted external {
        require(amount <= address(this).balance, "Not enough balance");
        bool sent = msg.sender.send(amount);
        require(sent, "Failed to send withdrawal");
    }
}
