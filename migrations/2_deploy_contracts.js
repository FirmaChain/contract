var FCT = artifacts.require('./token/FCT.sol');

module.exports = async (deployer, network) => {
  await deployer.deploy(FCT);
};
