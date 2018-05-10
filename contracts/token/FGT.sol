pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "../utils/MultiOwnable.sol";

contract FGT is StandardToken, MultiOwnable {

    using SafeMath for uint256;

    uint256 public constant TOTAL_CAP = 3000000000;

    string public constant name = "Firma Genesis Token";
    string public constant symbol = "FGT";
    uint256 public constant decimals = 18;

    bool isTransferable = false;

    function FGT() public {
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

    function mint(address _to, uint256 _amount) onlyOwner public returns (bool) {
        require(_to != address(0));

        uint256 amount = _amount.mul(10 ** decimals);
        require(amount >= 0);

        totalSupply_ = totalSupply_.add(amount);
        balances[_to] = balances[_to].add(amount);

        emit Mint(_to, amount);
        emit Transfer(address(0), _to, amount);

        return true;
    }

    function burn(uint256 _amount) onlyOwner public {
        uint256 amount = _amount.mul(10 ** decimals);
        require(amount >= 0);
        require(amount <= balances[msg.sender]);

        totalSupply_ = totalSupply_.sub(amount);
        balances[msg.sender] = balances[msg.sender].sub(amount);

        emit Burn(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
    }

    event Mint(address indexed _to, uint256 _amount);
    event Burn(address indexed _from, uint256 _amount);
}
