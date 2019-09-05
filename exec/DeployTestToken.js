const TestToken = artifacts.require('TestToken');

function toWei(n) {
    return new web3.BigNumber(String(web3.toWei(n, 'ether')));
}

module.exports = async function(callback) {
    let owner = "0xC6E0ee2975a9E245319A9452811845144fEE1338"; //Ropsten
    //let owner = "0xc6e0ee2975a9e245319a9452811845144fee1338" //Mainnet
    let token = await TestToken.new({from: owner});

    console.log("token", token.address);
}
