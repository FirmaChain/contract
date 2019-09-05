pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract TransferBulk is Ownable {
    ERC20 public token;

    constructor (address _token) public {
        token = ERC20(_token);
    }

    function transferBulks(address[] _addrs, uint256[] _amounts) public onlyOwner {
        require(_addrs.length == _amounts.length);
        for (uint256 i = 0; i < _addrs.length; i++) {
            token.transfer(_addrs[i], _amounts[i]);
        }
        emit TransferBulkEvent(_addrs, _amounts);
    }

    event TransferBulkEvent(address[] _addrs, uint256[] _amounts);
}
