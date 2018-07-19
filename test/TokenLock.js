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
	before(async () => {
		token = await FCT.new({from: owner});
		lock = await TokenLock.new(token.address, {from: owner});
		distribute = await TokenLockDistribute.new(token.address, lock.address, {from: owner});
		await lock.addOwner(distribute.address, {from: owner});
		await token.addOwner(lock.address, {from: owner});
		await token.addOwner(distribute.address, {from: owner});
	});

	it('Owner distributes FCT with locked amount to user', async() => {
		const totalAmount = 1000;
		const lockedAmount = 100;
		const unlockedAmount = totalAmount - lockedAmount;
		const beforeBalance = await token.balanceOf(user);
		await token.transfer(distribute.address, totalAmount, {from: owner}).should.be.fulfilled;

		const block = await web3.eth.getBlock("latest");
		const releaseBlockNumber = block.number + 3;
		await distribute.distribute(user, unlockedAmount, lockedAmount, releaseBlockNumber, {from: owner}).should.be.fulfilled;
		const afterBalance = await token.balanceOf(user);
		afterBalance.minus(beforeBalance).should.be.bignumber.equal(unlockedAmount);

		await lock.release(user, {from: owner}).should.be.rejected;
		await lock.release(user, {from: owner}).should.be.fulfilled;
		const finalBalance = await token.balanceOf(user);
		finalBalance.minus(beforeBalance).should.be.bignumber.equal(totalAmount);
	});
});

