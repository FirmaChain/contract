pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "../utils/MultiOwnable.sol";

contract FCT is StandardToken, MultiOwnable {

    using SafeMath for uint256;

    uint256 public constant TOTAL_CAP = 2200000000;

    string public constant name = "FirmaChain Token";
    string public constant symbol = "FCT";
    uint256 public constant decimals = 18;

    bool isTransferable = false;

    constructor() public {
        totalSupply_ = TOTAL_CAP.mul(10 ** decimals);
        balances[msg.sender] = totalSupply_;
        emit Transfer(address(0), msg.sender, balances[msg.sender]);
    }

    function unlock() external onlyOwner {
        isTransferable = true;
    }

    function lock() external onlyOwner {
        isTransferable = false;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(isTransferable || owners[msg.sender]);
        return super.transferFrom(_from, _to, _value);
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        require(isTransferable || owners[msg.sender]);
        return super.transfer(_to, _value);
    }

    // NOTE: _amount of 1 FCT is 10 ** decimals
    function mint(address _to, uint256 _amount) onlyOwner public returns (bool) {
        require(_to != address(0));

        totalSupply_ = totalSupply_.add(_amount);
        balances[_to] = balances[_to].add(_amount);

        emit Mint(_to, _amount);
        emit Transfer(address(0), _to, _amount);

        return true;
    }

    // NOTE: _amount of 1 FCT is 10 ** decimals
    function burn(uint256 _amount) onlyOwner public {
        require(_amount <= balances[msg.sender]);

        totalSupply_ = totalSupply_.sub(_amount);
        balances[msg.sender] = balances[msg.sender].sub(_amount);

        emit Burn(msg.sender, _amount);
        emit Transfer(msg.sender, address(0), _amount);
    }

    event Mint(address indexed _to, uint256 _amount);
    event Burn(address indexed _from, uint256 _amount);
}
