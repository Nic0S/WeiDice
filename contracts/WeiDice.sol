pragma solidity ^0.5.16;

import "./Admin.sol";

contract WeiDice is Admin {

    uint winProbability = 49;
    uint blockDelay = 2;

    // totalWagered must always stay <= contractBalance * 2 to ensure we can pay all winning bets.
    uint totalWagered = 0;
    mapping (address => Roll) rolls;

    struct Roll {
        // The block this roll was initiated in.
        uint block;

        // The amount wagered in wei.
        uint wager;
    }

    constructor() Admin() public {}

    event Rolled(address indexed roller, uint roll, bool won, uint wonAmount);

    function roll() external payable {
        require(msg.value > 0, "Cannot wager zero ETH");
        require((totalWagered + msg.value) * 2 <= address(this).balance,
            "Wager amount too high, balance too low for payout");
        require(rolls[msg.sender].wager == 0, "Roll already in progress");
        rolls[msg.sender] = Roll(block.number, msg.value);
        totalWagered += msg.value;
    }

    function getResult() external {
        require(rolls[msg.sender].wager > 0, "No roll in progress");
        uint targetBlock = rolls[msg.sender].block + blockDelay - 1;
        require(targetBlock < block.number, "Roll still in progress");

        // Only the block hash of the most recent 256 blocks is available. If the reward is not
        // collected before then we must always consider the wager lost to prevent attacks
        // that depend on a zero blockhash to exploit the RNG.
        bool expired = block.number - targetBlock >= 256;

        uint rand = randMod(100, targetBlock);
        if (rand < winProbability && !expired) {
            uint winnings = rolls[msg.sender].wager * 2;
            bool sent = msg.sender.send(winnings);
            require(sent, "Failed to send winnings");
            emit Rolled(msg.sender, rand, true, winnings);
        } else {
            emit Rolled(msg.sender, rand, false, 0);
        }
        totalWagered -= rolls[msg.sender].wager;
        delete rolls[msg.sender];
    }

    function getState() external view returns (bool active, uint blocksRemaining) {
        if (rolls[msg.sender].wager == 0) {
            return (false, 0);
        }
        uint targetBlock = rolls[msg.sender].block + blockDelay - 1;
        if (targetBlock < block.number) {
            return (true, 0);
        } else {
            return (true, targetBlock - block.number + 1);
        }
    }

    function randMod(uint _modulus, uint blockNum) internal view returns(uint) {
        return uint(keccak256(abi.encodePacked(msg.sender, blockhash(blockNum)))) % _modulus;
    }
}
