const WeiDice = artifacts.require("WeiDice");

module.exports = function(deployer) {
    deployer.deploy(WeiDice);
};
