const simple_contract = artifacts.require('simple_contract');

function toWei(n) {
    return new web3.BigNumber(String(web3.toWei(n, 'ether')));
}

module.exports = async function(callback) {
    //let owner = "0x9730ad937b270ee1ef7cacc38dbce30a33048ef9"; //Ropsten
    let owner = "0xc6e0ee2975a9e245319a9452811845144fee1338" //Mainnet
    try{
    	let aa = await simple_contract.new({from: owner});
	}catch(e){
		console.log(e)
	}
    console.log("token", aa);
}
