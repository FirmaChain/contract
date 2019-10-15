const util = require("./test-util")
const FCTV = artifacts.require('FCTV');
const BigNumber = web3.BigNumber
const L = require('mocha-logger')

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .use(require('chai-as-promised'))
  .should();

contract('[FCT] FirmaChain Token', function(accounts) {

	let fcti;
	const owner = accounts[0]
	const subOwner = accounts[1]
	const guest = accounts[2]

	const amount = 1;

	const _name = '[FCT] FirmaChain Token';
	const _symbol = 'FCT';
	const _decimals = 18;

	before(async () => {
		fcti = await FCTV.deployed();
	})

	it('has a name', async () => {
		const name = await fcti.name()
		assert.equal(name,_name);
	});

	it('has a symbol', async () => {
		const symbol = await fcti.symbol()
		assert.equal(symbol,_symbol);
	});

	it('has 18 decimals', async () => {
		const decimals = await fcti.decimals()
		assert.equal(decimals,_decimals);
	});

	it('should same total supply', async() =>{
		const balance = await fcti.balanceOf(owner);
		const totalSupply = await fcti.totalSupply();

		balance.should.be.bignumber.equal(totalSupply)
	})
	
	it('could add sub owner', async () => {
		await fcti.addOwner(subOwner, { from: owner });
		const value = await fcti.isOwner.call(subOwner)
		value.should.be.a('boolean').equal(true);
		
	});

	it('transfer unlock', async () => {
		await fcti.unlock()
	});

	it('shloud transfer correctly', async () => {
		const tx = await fcti.transfer(guest, amount)
		const balance = await fcti.balanceOf(guest);

		balance.should.be.bignumber.equal(new BigNumber(amount))
	});

	it('shloud reject tranfer when lack of balance', async () => {
		const balance = await fcti.balanceOf(guest);
		await fcti.transfer(owner, balance + amount, {from:guest}).should.be.rejected
	});

	it('transfer lock', async () => {
		await fcti.lock()
	});

	it('should reject to transfer', async () => {
		const beforeBalance = await fcti.balanceOf(guest);
		await fcti.transfer(owner, amount, {from:guest}).should.be.rejected;
		const afterBalance = await fcti.balanceOf(guest);

		beforeBalance.should.be.bignumber.equal(afterBalance)
	});

	// Mint
	it("should mint correctly", async () => {
		const beforeBalance = await fcti.balanceOf(subOwner);
		const beforeTotalSupply = await fcti.totalSupply();

		await fcti.mint(subOwner, util.wei(amount), { from: subOwner });
		const afterBalance = await fcti.balanceOf(subOwner);
		const afterTotalSupply = await fcti.totalSupply();


		const balanceGap = afterBalance.minus(beforeBalance);
		balanceGap.should.be.bignumber.equal(util.wei(amount), 'there are some problems in minting process');
		const supplyGap = new BigNumber(afterTotalSupply.minus(beforeTotalSupply));
		supplyGap.should.be.bignumber.equal(util.wei(amount), 'there are some problems in minting process');
	});

	// Burn
	it("should burn correctly", async () => {
		const beforeBalance = await fcti.balanceOf(subOwner);
		const beforeTotalSupply = await fcti.totalSupply();

		await fcti.burn(util.wei(amount), { from: subOwner });

		const afterBalance = await fcti.balanceOf(subOwner);
		const afterTotalSupply = await fcti.totalSupply();

		const balanceGap = beforeBalance.minus(afterBalance);
		balanceGap.should.be.bignumber.equal(util.wei(amount), 'there are some problems in burning process');
		
		const supplyGap = beforeTotalSupply.minus(afterTotalSupply);
		supplyGap.should.be.bignumber.equal(util.wei(amount), 'there are some problems in burning process');
	});


	it('should remove sub-owner', async () => {
		await fcti.removeOwner(subOwner, { from: subOwner });
        const value = await fcti.isOwner.call(subOwner)
        value.should.be.a('boolean').equal(false);
	});

	it('should be reject remove real-owner', async () => {
		await fcti.removeOwner(owner,{ from: owner }).should.be.rejected;
	});

});
