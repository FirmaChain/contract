const FCTV = artifacts.require('FCTV');

function toWei(n) {
    return new web3.BigNumber(String(web3.toWei(n, 'ether')));
}

module.exports = async function(callback) {
    //Mainnet
    const owner = "0xC6E0ee2975a9E245319A9452811845144fEE1338";
    const token = await FCTV.at("0xe1bad922f84b198a08292fb600319300ae32471b");
    //Ropsten
    // format: [address, unlockamount, lockamount]
    // example: ["0x6dF0473924D34e6608F9E8439742B9d1D5f30c89", 1897026.74, 758810.70], 
    let transferData = [
        ["0x3cf1a9ab722694efecb81225071439f1aba5df39", 1000000.00]
    ]; 
    for(let i = 0; i < transferData.length; i++) {
        let addr = transferData[i][0];
        let amount = toWei(transferData[i][1]);

        console.log("Transfering to", addr);
        token.transfer(addr, amount, {from: owner}).then((tx)=> {
            console.log("===================================================")
            console.log("addr : ", addr)
            console.log(tx)
            console.log("Complete");
            console.log("===================================================")
        });

        await new Promise(r=>setTimeout(r, 5000));
    }
    console.log("End");
}