const TokenSwap = artifacts.require('TokenSwap');
const FCTV = artifacts.require('FCTV');

function toWei(n) {
    return new web3.BigNumber(String(web3.toWei(n, 'ether')));
}

module.exports = async function(callback) {
    let owner = "0xc6e0ee2975a9e245319a9452811845144fee1338"; //Ropsten
    //let owner = "0xc6e0ee2975a9e245319a9452811845144fee1338" //Mainnet

    try{
    	let swap_address = "0x0d5734c6406d90205e5c5f9fa95bb1301c168e6f"
	    let token   = await FCTV.at("0xcacc32f1438e07f333051dd265c326ded0b6c0a8")
	    let swap 	= await TokenSwap.at(swap_address)

	    let balance = await token.balanceOf("0xc6e0ee2975a9e245319a9452811845144fee1338")
	    console.log("my balance", balance);

	    let b = await swap.checkSwapAmount("0xc6e0ee2975a9e245319a9452811845144fee1338");
	    let c = await swap.checkFirmaAddress("0xc6e0ee2975a9e245319a9452811845144fee1338");
	    console.log("amount", b )
	    console.log("address", c )
	    
	    let transfer_balance = toWei(132542)
	    let allow = await token.approve(swap_address, transfer_balance)
	    let a = await swap.registerSwap("firma1vm9hdhf4e02pt85pk634ucqtv54t0uelcjsvtv", transfer_balance);
	    console.log("---------------------")
	    console.log("swap", a)
	    console.log("---------------------")

	    b = await swap.checkSwapAmount("0xc6e0ee2975a9e245319a9452811845144fee1338");
	    c = await swap.checkFirmaAddress("0xc6e0ee2975a9e245319a9452811845144fee1338");
	    console.log("amount", b )
	    console.log("address", c )

	    let withdraw = await swap.withdraw();
	    console.log("withdraw", withdraw)

	} catch(err) {
		console.log(err, 'err')
	}

    console.log("token swap end")
}
