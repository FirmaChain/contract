var FCTV = artifacts.require('FCTV');
var FCTVTransferBulk = artifacts.require('FCTVTransferBulk');

module.exports = function(deployer) {
	deployer.then( async() => {
		await deployer.deploy(FCTVTransferBulk, FCTV.address);
	})
};