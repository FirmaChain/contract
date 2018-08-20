const util = require("./test-util");
const FCT = artifacts.require('FCT');
const PreSaleI = artifacts.require('PreSaleI');
const BigNumber = web3.BigNumber;
const L = require('mocha-logger');

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .use(require('chai-as-promised'))
  .should();

contract('Pre Sale I', function(accounts) {
	const owner = accounts[0];
	const whitelisteds = accounts.slice(1, 6);
	const nonWhitelisted = accounts[7];

	const wallet = owner;
	const exchangeRate = 20000 + 4000;
	const minValue = util.wei(0.005);
	const maxTotal = util.wei(1);
	const maxTotalPerAddress = util.wei(0.5);

	const testUnitAmount = 0.1;
	const underMinValue = 0.001;
	const epsilon = 0.1; // NOTE: regarded as transaction fee

	let token;
	let sale;

	before(async() => {
		token = await FCT.new({from: owner});
		await util.sendTransaction({from: owner, to: whitelisteds[0], value: maxTotal});
		await util.sendTransaction({from: owner, to: whitelisteds[1], value: maxTotal});
		await util.sendTransaction({from: owner, to: whitelisteds[2], value: maxTotal});
		await util.sendTransaction({from: owner, to: whitelisteds[3], value: maxTotalPerAddress});
		await util.sendTransaction({from: owner, to: nonWhitelisted, value: util.wei(testUnitAmount)});
	});

	describe('Check block number', async() => {
		let startBlockNumber;
		let endBlockNumber;
		let sale;

		before(async() => {
			startBlockNumber = await util.getBlockNumber() + 10;
			endBlockNumber = startBlockNumber + 10;
			sale = await PreSaleI.new(token.address, wallet, exchangeRate, minValue, maxTotal, maxTotalPerAddress, startBlockNumber, endBlockNumber, {from: owner});
			await sale.addAddressToWhitelist(whitelisteds[0], {from: owner});
		});
	
		it('Should reject before start block number', async() => {
			await sale.toggleEnabled({from: owner});
			await sale.sendTransaction({from: whitelisteds[0], value: util.wei(testUnitAmount)}).should.be.rejected;
			let nowBlockNumber = await util.getBlockNumber();
			if (nowBlockNumber >= startBlockNumber) {
				console.log("Possibly incomplete test");
			}
		});

		it('Should accept during block number range', async() => {
			let nowBlockNumber = await util.getBlockNumber();
			while(nowBlockNumber < startBlockNumber) {
				//util.sendTransaction({from: owner, to: whitelisteds[0], value: 0}); // Do the meaningless in order to mine blocks during test
				nowBlockNumber = await util.getBlockNumber();
			}
			await sale.sendTransaction({from: whitelisteds[0], value: util.wei(testUnitAmount)}).should.be.fulfilled;
		});

		it('Should reject after end block number', async() => {
			let nowBlockNumber = await util.getBlockNumber();
			while(nowBlockNumber < endBlockNumber) {
				//util.sendTransaction({from: owner, to: whitelisteds[0], value: 0}); // Do the meaningless in order to mine blocks during test
				nowBlockNumber = await util.getBlockNumber();
			}
			await sale.sendTransaction({from: whitelisteds[0], value: util.wei(testUnitAmount)}).should.be.rejected;
		});
	});

	describe('Check functionality', async() => {
		let startBlockNumber;
		let endBlockNumber;
		let sale;

		before(async() => {
			startBlockNumber = await util.getBlockNumber();
			endBlockNumber = startBlockNumber + 50;
			sale = await PreSaleI.new(token.address, wallet, exchangeRate, minValue, maxTotal, maxTotalPerAddress, startBlockNumber, endBlockNumber, {from: owner});
			await token.addOwner(sale.address, {from: owner}).should.be.fulfilled;
			await token.transfer(sale.address, maxTotal * exchangeRate, {from: owner});
			await sale.addAddressesToWhitelist(whitelisteds, {from: owner});
		});

		describe('During sale', async() => {
			it('Should reject during not enabled', async() => {
				await sale.sendTransaction({from: whitelisteds[1], value: util.wei(testUnitAmount)}).should.be.rejected;
				await sale.toggleEnabled({from: owner});
				await sale.sendTransaction({from: whitelisteds[1], value: util.wei(testUnitAmount)}).should.be.fulfilled;
			});

			it('Should reject non white list user', async() => {
				await sale.sendTransaction({from: nonWhitelisted, value: util.wei(testUnitAmount)}).should.be.rejected;
			});

			it('Should reject value below minumum limit', async() => {
				await sale.sendTransaction({from: whitelisteds[1], value: util.wei(underMinValue)}).should.be.rejected;
			});

			it('Check refund and limit per address', async() => {
				let beforeEther = await util.getBalance(whitelisteds[0]);
				await sale.sendTransaction({from: whitelisteds[0], value: maxTotalPerAddress});
				let afterEther = await util.getBalance(whitelisteds[0]);
				beforeEther.minus(afterEther).should.be.bignumber.below(maxTotalPerAddress - util.wei(testUnitAmount) + util.wei(epsilon));
				await sale.sendTransaction({from: whitelisteds[0], value: minValue}).should.be.rejected;
			});

			it('Check total limit', async() => {
				await sale.sendTransaction({from: whitelisteds[2], value: maxTotalPerAddress}).should.be.fulfilled;
				await sale.sendTransaction({from: whitelisteds[2], value: maxTotalPerAddress}).should.be.rejected;
				await sale.sendTransaction({from: whitelisteds[3], value: maxTotalPerAddress}).should.be.rejected;
			});
		});

		describe('After sale', async() => {
			it('Wait until end block number', async() => {
				let nowBlockNumber = await util.getBlockNumber();
				console.log("Check block number", nowBlockNumber, endBlockNumber);
				while(nowBlockNumber <= endBlockNumber) {
					//util.sendTransaction({from: owner, to: whitelisteds[0], value: 0}); // Do the meaningless in order to mine blocks during test
					nowBlockNumber = await util.getBlockNumber();
				}
			});

			it('Reject refund and deliver before not enabled', async() => {
				await sale.refund(whitelisteds[1], {from: owner}).should.be.rejected;
				await sale.deliver(whitelisteds[1], {from: owner}).should.be.rejected;
			});

			it('Accept refund after enabled', async() => {
				await sale.toggleEnabled({from: owner});
				let beforeEther = await util.getBalance(whitelisteds[1]);
				let amount = await sale.buyAmounts(whitelisteds[1]);
				await sale.refund(whitelisteds[1], {from: owner}).should.be.fulfilled;
				let afterEther = await util.getBalance(whitelisteds[1]);
				afterEther.minus(beforeEther).should.be.bignumber.equal(amount);
			});

			it('Reject terminate before delivery is done', async() => {
				await sale.terminate({from: owner}).should.be.rejected;
			});

			it('Check to deliver the exact amount', async() => {
				let beforeAmount = await token.balanceOf(whitelisteds[0]);
				let deliverAmount = await sale.buyAmounts(whitelisteds[0]) * exchangeRate;
				await sale.deliver(whitelisteds[0], {from: owner}).should.be.fulfilled;
				let afterAmount = await token.balanceOf(whitelisteds[0]);
				afterAmount.minus(beforeAmount).should.be.bignumber.equal(deliverAmount);
			});

			it('Reject to deliver twice', async() => {
				await sale.deliver(whitelisteds[0], {from: owner}).should.be.rejected;
				await sale.deliver(whitelisteds[1], {from: owner}).should.be.rejected;
				await sale.deliver(whitelisteds[2], {from: owner}).should.be.fulfilled;
			});

			it('Terminate', async() => {
				let saleEther = await util.getBalance(sale.address);
				let saleToken = await token.balanceOf(sale.address);
				let beforeEther = await util.getBalance(wallet);
				let beforeToken = await token.balanceOf(wallet);
				await sale.terminate({from: owner}).should.be.fulfilled;
				let afterEther = await util.getBalance(wallet);
				let afterToken = await token.balanceOf(wallet);
				saleEther.minus(afterEther.minus(beforeEther)).should.be.bignumber.below(util.wei(epsilon));
				afterToken.minus(beforeToken).should.be.bignumber.equal(saleToken);
			});
		});
	});
});

