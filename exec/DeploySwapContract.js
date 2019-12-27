const TokenSwap = artifacts.require('TokenSwap');

function toWei(n) {
    return new web3.BigNumber(String(web3.toWei(n, 'ether')));
}

module.exports = async function(callback) {
    let owner = "0xc6e0ee2975a9e245319a9452811845144fee1338"; //Ropsten
    //let owner = "0xc6e0ee2975a9e245319a9452811845144fee1338" //Mainnet
    
    try{
    	let aa = await TokenSwap.new("0xcacc32f1438e07f333051dd265c326ded0b6c0a8", {from: owner});
	}catch(e){
		console.log(e)
	}
    console.log("token swap", aa);
}
