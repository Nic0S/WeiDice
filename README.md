# WeiDice

A simple double-or-nothing gambling smart contract to learn the basics of Solidity development.

This is for educational purposes only and should only be used on testnets.

# Try it out

WeiDice is deployed on the Rinkeby testnet:
[0x70755Df8097Ac4718c7b72B78F7539A176096791](https://rinkeby.etherscan.io/address/0x70755Df8097Ac4718c7b72B78F7539A176096791)

And you can use this painful frontend to interact with it: https://nic0s.github.io/WeiDice/web/weidice.html?contract=0x70755Df8097Ac4718c7b72B78F7539A176096791

**Make sure your MetaMask is pointing at the Rinkeby testnet before making any transactions.**

# Security

This contract uses a future blockhash for random number generation. This means that if a user makes
a wager at block n, the RNG will be based of the hash of block (n + x), where x is a constant
defined by the contract owner.

Since the hash of future blocks is unknown to the user at the time of the wager (with the caveats
below), this prevents a user from knowing the result of their bet before it's included in a block.

With enough hashpower, however, this contract could still be exploited. An attacker with a pending
bet withhold any blocks they mine at index (n + x) that would result in them losing their existing
roll.

In order to be profitable the size of the attacker's bet would need to be at least similar in size
to the block reward, to compensate for the risk of another miner finding the next block before the
attacker.
