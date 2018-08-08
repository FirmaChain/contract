const util = require("./test-util");
const FCT = artifacts.require('FCT');
const TokenLock = artifacts.require('TokenLock');
const TokenLockDistribute = artifacts.require('TokenLockDistribute');
const BigNumber = web3.BigNumber;
const L = require('mocha-logger');

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .use(require('chai-as-promised'))
  .should();

contract('Token Distribute And Lock', function(accounts) {
	let token;
	let lock;
	let distribute;
	const owner = accounts[0];
	const user = accounts[1];
	const user2 = accounts[2];
	before(async () => {
		token = await FCT.deployed();
		lock = await TokenLock.deployed();
		distribute = await TokenLockDistribute.deployed();
	});

	it('Distribute contract is added as owner in lock contract', async() => {
		await lock.addOwner(distribute.address, {from: owner}).should.be.fulfilled;
	});

	it('Lock contract is added as owner in token contract', async() => {
		await token.addOwner(lock.address, {from: owner}).should.be.fulfilled;
	});

	it('Distribute contract is added as owner in token contract', async() => {
		await token.addOwner(distribute.address, {from: owner}).should.be.fulfilled;
	});

	let releaseTimestamp1;
	let beforeBalance1;
	const totalAmount = 1000;
	const lockedAmount = 100;
	const unlockedAmount = totalAmount - lockedAmount;
	it('Owner distributes FCT with locked amount to user', async() => {
		beforeBalance1 = await token.balanceOf(user);
		await token.transfer(distribute.address, totalAmount, {from: owner}).should.be.fulfilled;

		releaseTimestamp1 = Math.floor(Date.now() / 1000) + 180;
		await distribute.distribute(user, unlockedAmount, lockedAmount, releaseTimestamp1, {from: owner}).should.be.fulfilled;
		const afterBalance = await token.balanceOf(user);
		afterBalance.minus(beforeBalance1).should.be.bignumber.equal(unlockedAmount);

		await lock.release(user, {from: owner}).should.be.rejected;
	});

	let releaseTimestamp2;
	let beforeBalance2;
	it('Owner distributes FCT with locked amount to the another user', async() => {
		beforeBalance2 = await token.balanceOf(user2);
		await token.transfer(distribute.address, totalAmount, {from: owner}).should.be.fulfilled;

		releaseTimestamp2 = Math.floor(Date.now() / 1000);
		await distribute.distribute(user2, unlockedAmount, lockedAmount, releaseTimestamp2, {from: owner}).should.be.fulfilled;
		const afterBalance = await token.balanceOf(user2);
		afterBalance.minus(beforeBalance2).should.be.bignumber.equal(unlockedAmount);
	});

	it('Owner waits block to release', async() => {
		// NOTE: Wait blocks for network
		let nowBlock = await util.getBlock("latest");
		while(nowBlock.timestamp < releaseTimestamp1) {
			nowBlock = await util.getBlock("latest");
		}
		await lock.release(user, {from: owner}).should.be.fulfilled;
		const finalBalance = await token.balanceOf(user);
		finalBalance.minus(beforeBalance1).should.be.bignumber.equal(totalAmount);
	});

	it('User can claim to release his own', async() => {
		await lock.release(user2, {from: user2}).should.be.fulfilled;
		const finalBalance = await token.balanceOf(user2);
		finalBalance.minus(beforeBalance2).should.be.bignumber.equal(totalAmount);
	});
});

