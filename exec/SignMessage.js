const FCTV = artifacts.require('FCTV');

function toWei(n) {
    return new web3.BigNumber(String(web3.toWei(n, 'ether')));
}

module.exports = async function(callback) {
    try{
    	var accounts = await web3.eth.getAccounts()
		console.log(accounts)

    	const owner = "0xC6E0ee2975a9E245319A9452811845144fEE1338";
	    const message = "[Etherscan.io 12/09/2019 14:24:10] I, hereby verify that I am the owner/creator of the address [0xe1bad922f84b198a08292fb600319300ae32471b]";

	    let token = await FCTV.at("0xe1bad922f84b198a08292fb600319300ae32471b");

	    let a = await web3.eth.sign(message, owner);
	    console.log("sign hash", a)
	    console.log("End");
	} catch(err) {
		console.log("err", err)
	}
}
