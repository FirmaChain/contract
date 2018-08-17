const util = require("./test-util");
const Poc = artifacts.require('Poc');
const BigNumber = web3.BigNumber;
const L = require('mocha-logger');

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .use(require('chai-as-promised'))
  .should();

contract('Poc', function(accounts) {
	let poc;
	let partiesOfContractBefore;
	let partiesOfContractAfter;

	const owner = accounts[0];
	const parties = accounts.slice(0, 2);
	const parties3 = accounts.slice(0, 3);

	const contractId0 = new web3.BigNumber("0xa7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8ffff");
	const contractId = new web3.BigNumber("0xa7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a");
	const contractId3 = new web3.BigNumber("0xa7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f80002");
	const contractSign = new web3.BigNumber("0xa7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f80000");
	const contractSignWrong = new web3.BigNumber("0xa7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f80001");

	before(async () => {
		poc = await Poc.new({from: owner});
	});

	it('Create New Contract with short lifetime', async () => {
		await poc.newContract(contractId0, parties, 1).should.be.fulfilled;
	});

	it('Reject contract in a person', async () => {
		await poc.newContract(contractId, [owner], 100).should.be.rejected;
	});

	it('Reject contract whose lifetime is zero', async () => {
		await poc.newContract(contractId, [owner], 0).should.be.rejected;
	});

	it('Reject contract with duplicated parties', async () => {
		await poc.newContract(contractId, [owner, owner], 0).should.be.rejected;
		await poc.newContract(contractId, [parties[0], parties[1], parties[0]], 0).should.be.rejected;
	});

	it('Create New Contract among two', async () => {
		await poc.newContract(contractId, parties, 100).should.be.fulfilled;
	});

	it('Reject duplicated signs', async () => {
		await poc.signContract(contractId, contractSign, {from: parties[0]}).should.be.fulfilled;
		await poc.signContract(contractId, contractSign, {from: parties[0]}).should.be.rejected;
	});

	it('Reject sign by person not in party', async () => {
		await poc.signContract(contractId, contractSign, {from: parties3[2]}).should.be.rejected;
	});

	it('Complete contract two sign', async () => {
		let resultBefore = await poc.getStatus(contractId);
		resultBefore.should.be.bignumber.equal(0);
		await poc.signContract(contractId, contractSign, {from: parties[1]}).should.be.fulfilled;
		let resultAfter = await poc.getStatus(contractId);
		resultAfter.should.be.bignumber.equal(1);
	});

	it('Reject contract with duplicated approved contract id', async () => {
		await poc.newContract(contractId, parties, 100).should.be.rejected;
	});

	it('Fail to accept contract with different sign', async () => {
		await poc.newContract(contractId3, parties3, 100).should.be.fulfilled;
		partiesOfContractBefore = await poc.getParties(contractId3);
		await poc.signContract(contractId3, contractSign, {from: parties3[0]}).should.be.fulfilled;
		await poc.signContract(contractId3, contractSignWrong, {from: parties3[1]}).should.be.fulfilled;
		await poc.signContract(contractId3, contractSign, {from: parties3[2]}).should.be.fulfilled;
		let result = await poc.getStatus(contractId3);
		result.should.be.bignumber.equal(-1);
	});

	it('Accept overwrited contract', async () => {
		await poc.newContract(contractId3, parties, 100).should.be.fulfilled;
	});

	it('Accept overwrited contract whose lifetime is over', async () => {
		await poc.newContract(contractId0, parties, 1).should.be.fulfilled;
	});

	it('Check the removal of old data', async () => {
		let partiesOfContractAfter = await poc.getParties(contractId3);
		JSON.stringify(partiesOfContractBefore).should.be.not.equal(JSON.stringify(partiesOfContractAfter));
	});
});

