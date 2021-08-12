const WeiDice = artifacts.require("WeiDice");
const utils = require("./helpers/utils");
var expect = require('chai').expect;

contract("WeiDice", (accounts) => {
  let blockDelay = 2;
  let [owner, alice, bob] = accounts;
  let contract;
  beforeEach(async () => {
    contract = await WeiDice.new();
    const result = await contract.deposit({from: owner, value: utils.wei(5)});
    expect(result.receipt.status).to.equal(true);
    expect(await web3.eth.getBalance(contract.address)).to.equal(utils.wei(5));
  });
  it("should be able to make a wager", async () => {
    const roll = await contract.roll({from: bob, value: utils.wei(1)});
    expect(roll.receipt.status).to.equal(true);
    const state = await contract.getState.call({from: bob});
    expect(state.active).to.equal(true);
    expect(state.blocksRemaining.toNumber()).to.equal(blockDelay);

    // Must wait for blockDelay blocks
    await utils.shouldThrow(contract.getResult({from: bob}))
    utils.mine(blockDelay);

    const result = await contract.getResult({from: bob})
    expect(result.receipt.status)
  })
  it("should be able to wager the amount the contract has", async () => {
    const result = await contract.roll({from: bob, value: utils.wei(5)});
    expect(result.receipt.status).to.equal(true);
  })
  it("should not be able to wager more than the contract has", async () => {
    await utils.shouldThrow(contract.roll({from: bob, value: utils.wei(6)}))
  })
  it("should not be able to have total wager above contract balance", async () => {
    const result = await contract.roll({from: bob, value: utils.wei(3)});
    expect(result.receipt.status).to.equal(true);
    await utils.shouldThrow(contract.roll({from: alice, value: utils.wei(4)}))
  })
  it("should not be able to create two concurrent wagers", async () => {
    const result = await contract.roll({from: bob, value: utils.wei(1)});
    expect(result.receipt.status).to.equal(true);
    await utils.shouldThrow(contract.roll({from: bob, value: utils.wei(1)}))
  })
})