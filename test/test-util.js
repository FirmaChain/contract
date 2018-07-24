module.exports = {
	wei:function(n) {
	  return new web3.BigNumber(String(web3.toWei(n, 'ether')));
	},
	getBlockNumber: function() {
		return new Promise((resolve, reject) => {
			web3.eth.getBlockNumber((e, r) => e ? reject(e) : resolve(r))
		});
	},
}
