var FGT = artifacts.require('./token/FGT.sol');

module.exports = async (deployer, network) => {
  await deployer.deploy(FGT);
};
