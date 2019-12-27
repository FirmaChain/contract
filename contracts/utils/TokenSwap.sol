pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract TokenSwap is Ownable{
    using SafeMath for uint256;
    address public wallet;
    ERC20 public token;
    mapping (address => uint256) public swapAmount;
    mapping (address => string) public swapFirmaNetAddress;

    constructor (address _token) public {
        token = ERC20(_token);
        wallet = msg.sender;
    }


    function registerSwap(string _firmaNetAddress, uint256 balance) public payable {
        uint256 my_balance = token.balanceOf(msg.sender);
        require(balance > 0, "Should be more than 0");
        require(balance <= my_balance, "Should be equal or less than what I have");
        uint256 allowBalance = token.allowance(msg.sender, address(this));
        require(balance <= allowBalance, "Should be equal or less than what I allowed");
        require(token.transferFrom(msg.sender, address(this), balance), "'transferFrom' function call failed");

        swapAmount[msg.sender] = swapAmount[msg.sender].add(balance);
        swapFirmaNetAddress[msg.sender] = _firmaNetAddress;
        emit Swap(msg.sender, balance, _firmaNetAddress);
    }
    event Swap(address sender, uint256 balance, string firmaNetAddress);


    function changeAddress(string _firmaNetAddress) public {
        swapFirmaNetAddress[msg.sender] = _firmaNetAddress;

        emit ChangeAddress(msg.sender, _firmaNetAddress);
    }
    event ChangeAddress(address sender, string firmaNetAddress);


    function checkSwapAmount(address _addr) public view returns (uint256) {
        return swapAmount[_addr];
    }

    function checkFirmaAddress(address _addr) public view returns (string) {
        return swapFirmaNetAddress[_addr];
    }


    function withdraw() public onlyOwner {
        token.transfer(msg.sender, token.balanceOf(address(this)));
        msg.sender.transfer(address(this).balance);
    }
}