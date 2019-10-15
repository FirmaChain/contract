let list=``

const FCTV = artifacts.require('FCTV');
const FCTVTransferBulk = artifacts.require('FCTVTransferBulk');

function toWei(n) {
    return new web3.BigNumber(String(web3.toWei(n, 'ether')));
}

module.exports = async function(callback) {
	//let owner = "0x9730ad937b270ee1ef7cacc38dbce30a33048ef9"; //Ropsten
	let owner = "0xc6e0ee2975a9e245319a9452811845144fee1338" //Mainnet
	// TODO: input address
	let token = await FCTV.at("0xe1bad922f84b198a08292fb600319300ae32471b");
	let bulk = await FCTVTransferBulk.at("0x0da79331d7a3bf6f714b36e0275509c429a2dd20");

	const BULK_INDEX = 2;
	const BULK_COUNT = 100;
	let addrs = [];
	let weis = [];
	let lists = list.split("\n");
	for(let i = 0; i < lists.length; i++) {
		let parts = lists[i].split("\t");
		addrs.push(parts[0]);
		weis.push(toWei(parts[1]));
	}
	console.log("addr")
	console.log(addrs.slice(BULK_INDEX * BULK_COUNT, (BULK_INDEX + 1) * BULK_COUNT).length);
	console.log(addrs.slice(BULK_INDEX * BULK_COUNT, (BULK_INDEX + 1) * BULK_COUNT));
	console.log("weis")
	console.log(weis.slice(BULK_INDEX * BULK_COUNT, (BULK_INDEX + 1) * BULK_COUNT).length);
	console.log(weis.slice(BULK_INDEX * BULK_COUNT, (BULK_INDEX + 1) * BULK_COUNT));
	console.log("=======================")

	try {
		let result = await bulk.transferBulks(addrs.slice(BULK_INDEX * BULK_COUNT, (BULK_INDEX + 1) * BULK_COUNT), weis.slice(BULK_INDEX * BULK_COUNT, (BULK_INDEX + 1) * BULK_COUNT), {from: owner});
		console.log(result);
	} catch(e){
		console.log("error:", e)
	}
	console.log("Complete" + BULK_INDEX);
}

