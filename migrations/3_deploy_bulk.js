var TokenSwap = artifacts.require('TokenSwap');
var FCTV = artifacts.require('FCTV');

module.exports = function(deployer) {
	deployer.then( async() => {
		await deployer.deploy(FCTV);
		await deployer.deploy(TokenSwap, FCTV.address);
	})
};