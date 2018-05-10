pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract PreSale {

	ERC20 public token;
	address public owner;

	function PreSale(address _owner, ERC20 _token) public {
		owner = _owner;
		token = _token;
	}
}