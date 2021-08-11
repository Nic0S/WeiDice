pragma solidity ^0.5.16;

import "./Admin.sol";

contract WeiDice is Admin {

    uint randNonce = 0;
    uint winProbability = 49;

    constructor() Admin() public {}

    event Rolled(address indexed roller, uint roll, bool won, uint wonAmount);

    function roll() external payable {
        require(msg.value > 0, "Cannot wager zero ETH");
        require(msg.value * 2 <= address(this).balance,
            "Wager amount too high, balance too low for payout");

        uint rand = randMod(100);
        if (rand < winProbability) {
            uint winnings = msg.value * 2;
            bool sent = msg.sender.send(winnings);
            require(sent, "Failed to send winnings");
            emit Rolled(msg.sender, rand, true, winnings);
        } else {
            emit Rolled(msg.sender, rand, false, 0);
        }
    }

    function randMod(uint _modulus) internal returns(uint) {
        // TODO: Secure random number generation
        randNonce++;
        return uint(keccak256(abi.encodePacked(now, msg.sender, randNonce))) % _modulus;
    }
}
