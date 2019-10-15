var FCT = artifacts.require('FCT');
var FCTV = artifacts.require('FCTV');
var TokenLock = artifacts.require('TokenLock');
var TokenLockDistribute = artifacts.require('TokenLockDistribute');

module.exports = async (deployer, network) => {
	deployer.then( async() => {
		// await deployer.deploy(FCT);
		// await deployer.deploy(TokenLock, FCT.address)
		// await deployer.deploy(TokenLockDistribute, FCT.address, TokenLock.address)
		await deployer.deploy(FCTV);
	})
};
