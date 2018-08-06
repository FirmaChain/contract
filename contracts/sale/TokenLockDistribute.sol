pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./TokenLock.sol";

contract TokenLockDistribute is Ownable {
    ERC20 public token;
    TokenLock public lock;

    constructor (address _token, address _lock) public {
        token = ERC20(_token);
        lock = TokenLock(_lock);
    }

    function distribute(address _to, uint256 _unlockedAmount, uint256 _lockedAmount, uint256 _releaseTimestamp) public onlyOwner {
        require(_to != address(0));
        token.transfer(address(lock), _lockedAmount);
        lock.lock(_to, _lockedAmount, _releaseTimestamp);
        token.transfer(_to, _unlockedAmount);

        emit Distribute(_to, _unlockedAmount, _lockedAmount, _releaseTimestamp);
    }

    event Distribute(address indexed _to, uint256 _unlockedAmount, uint256 _lockedAmount, uint256 _releaseTimestamp);
}

