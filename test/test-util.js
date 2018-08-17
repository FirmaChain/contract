module.exports = {
	wei:function(n) {
	  return new web3.BigNumber(String(web3.toWei(n, 'ether')));
	},
	getBlock: function(value) {
		return new Promise((resolve, reject) => {
			web3.eth.getBlock(value, (e, r) => e ? reject(e) : resolve(r))
		});
	},
	getBlockNumber: function() {
		return new Promise((resolve, reject) => {
			web3.eth.getBlockNumber((e, r) => e ? reject(e) : resolve(r))
		});
	},
	sendTransaction: function(value) {
		return new Promise((resolve, reject) => {
			web3.eth.sendTransaction(value, (e, r) => e ? reject(e) : resolve(r))
		});
	},
	getBalance: function(value) {
		return new Promise((resolve, reject) => {
			web3.eth.getBalance(value, (e, r) => e ? reject(e) : resolve(r))
		});
	},
}
