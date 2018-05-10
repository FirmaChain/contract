module.exports = {
	wei:function  (n) {
	  return new web3.BigNumber(String(web3.toWei(n, 'ether')));
	}
}