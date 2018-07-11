const util = require("./test-util");
const FCT = artifacts.require('FCT');
const TokenLock = artifacts.require('TokenLock');
const BigNumber = web3.BigNumber;
const L = require('mocha-logger');

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .use(require('chai-as-promised'))
  .should();

contract('Token Lock', function(accounts) {
	let token;
	let lock;
	const TOTAL_LOCK_AMOUNT = 10000;
	const amount = 1;
	const owner = accounts[0];
	const user = accounts[1];
	before(async () => {
		token = await FCT.new({from: owner});
		lock = await TokenLock.new(token.address, {from: owner});
	});

	it('Base setting', async() => {
		await token.addOwner(lock.address, { from: owner });
		await token.transfer(lock.address, TOTAL_LOCK_AMOUNT, {from: owner});
	});

	it('Owner gives locked amount to users', async () => {
		const beforeBalance = await token.balanceOf(user);
		const block = await web3.eth.getBlock("latest");
		await lock.lock(user, amount, block.number + 3, {from: owner}).should.be.fulfilled;
		await lock.release(user, {from: owner}).should.be.rejected;
		await lock.release(user, {from: owner}).should.be.fulfilled;
		const afterBalance = await token.balanceOf(user);
		afterBalance.minus(beforeBalance).should.be.bignumber.equal(amount);
	});

});

