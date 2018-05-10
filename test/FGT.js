const util = require("./test-util")
const FGT = artifacts.require('FGT');
const BigNumber = web3.BigNumber
const L = require('mocha-logger')

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .use(require('chai-as-promised'))
  .should();

contract('Firma Genesis Token', function(accounts) {

	let fgti;
	const owner = accounts[0]
	const subOwner = accounts[1]
	const guest = accounts[2]

	const amount = 1;

	const _name = 'Firma Genesis Token';
	const _symbol = 'FGT';
	const _decimals = 18;

	before(async () => {
		fgti = await FGT.new({ from: owner });
	})

	it('has a name', async () => {
		const name = await fgti.name()
		assert.equal(name,_name);
	});

	it('has a symbol', async () => {
		const symbol = await fgti.symbol()
		assert.equal(symbol,_symbol);
	});

	it('has 18 decimals', async () => {
		const decimals = await fgti.decimals()
		assert.equal(decimals,_decimals);
	});

	it('should same total supply', async() =>{
		const balance = await fgti.balanceOf(owner);
		const totalSupply = await fgti.totalSupply();

		balance.should.be.bignumber.equal(totalSupply)
	})
	
	it('could add sub owner', async () => {
		await fgti.addOwner(subOwner, { from: owner });
		const value = await fgti.isOwner.call(subOwner)
		value.should.be.a('boolean').equal(true);
		
	});

	it('transfer unlock', async () => {
		await fgti.unlock()
	});

	it('shloud transfer correctly', async () => {
		const tx = await fgti.transfer(guest, amount)
		const balance = await fgti.balanceOf(guest);

		balance.should.be.bignumber.equal(new BigNumber(amount))
	});

	it('shloud reject tranfer when lack of balance', async () => {
		const balance = await fgti.balanceOf(guest);
		await fgti.transfer(owner, balance + amount, {from:guest}).should.be.rejected
	});

	it('transfer lock', async () => {
		await fgti.lock()
	});

	it('should reject to transfer', async () => {
		const beforeBalance = await fgti.balanceOf(guest);
		await fgti.transfer(owner, amount, {from:guest}).should.be.rejected;
		const afterBalance = await fgti.balanceOf(guest);

		beforeBalance.should.be.bignumber.equal(afterBalance)
	});

	// Mint
	it("should mint correctly", async () => {
		const beforeBalance = await fgti.balanceOf(subOwner);
		const beforeTotalSupply = await fgti.totalSupply();

		await fgti.mint(subOwner, amount, { from: subOwner });
		const afterBalance = await fgti.balanceOf(subOwner);
		const afterTotalSupply = await fgti.totalSupply();


		const balanceGap = afterBalance.minus(beforeBalance);
		balanceGap.should.be.bignumber.equal(util.wei(amount), 'there are some problems in minting process');
		const supplyGap = new BigNumber(afterTotalSupply.minus(beforeTotalSupply));
		supplyGap.should.be.bignumber.equal(util.wei(amount), 'there are some problems in minting process');
	});

	// Burn
	it("should reject to try to burn excessive amount, and amount should be not multiplied by 10 ** _decimals", async () => {
		const balance = await fgti.balanceOf(subOwner);
		await fgti.burn(balance, { from: subOwner }).should.be.rejected;
	});

	// Burn
	it("should burn correctly", async () => {
		const beforeBalance = await fgti.balanceOf(subOwner);
		const beforeTotalSupply = await fgti.totalSupply();

		await fgti.burn(amount, { from: subOwner });

		const afterBalance = await fgti.balanceOf(subOwner);
		const afterTotalSupply = await fgti.totalSupply();

		const balanceGap = beforeBalance.minus(afterBalance);
		balanceGap.should.be.bignumber.equal(util.wei(amount), 'there are some problems in burning process');
		
		const supplyGap = beforeTotalSupply.minus(afterTotalSupply);
		supplyGap.should.be.bignumber.equal(util.wei(amount), 'there are some problems in burning process');
	});


	it('should remove sub-owner', async () => {
		await fgti.removeOwner(subOwner, { from: subOwner });
        const value = await fgti.isOwner.call(subOwner)
        value.should.be.a('boolean').equal(false);
	});

	it('should be reject remove real-owner', async () => {
		await fgti.removeOwner(owner,{ from: owner }).should.be.rejected;
	});

});
