pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract TokenLock is Ownable {
			ERC20 public token;
			mapping (address => uint256) public lockAmounts;
			mapping (address => uint256) public releaseBlocks;

			constructor (address _token) public {
				token = ERC20(_token);
			}

			function getBalance(address _addr) external view returns (uint256) {
				return lockAmounts[_addr];
			}

			function lock(address _addr, uint256 _amount, uint256 _releaseBlock) external {
				require(msg.sender == owner);
				require(_addr != address(0));
				lockAmounts[_addr] = _amount;
				releaseBlocks[_addr] = _releaseBlock;
			}

			function release(address _addr) external {
				require(msg.sender == owner || msg.sender == _addr);
				require(block.number >= releaseBlocks[_addr]);
				uint256 amount = lockAmounts[_addr];
				lockAmounts[_addr] = 0;
				releaseBlocks[_addr] = 0;
				token.transfer(_addr, amount);
			}
}

