pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Whitelist.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract PreSaleI is Whitelist {
    using SafeMath for uint256;
    // rate is the amount of token to the ether. Bonus rate is included in exchange rate.
    uint256 public exchangeRate;
    
    // in ETH(wei), not token
    uint256 public minValue;
    uint256 public maxTotal;
    uint256 public maxPerAddress;

    uint256 public startTimestamp;
    uint256 public endTimestamp;
    bool public enabled;

    address public wallet;
    ERC20 public token;
    
    // in ETH(wei), not token
    uint256 public accumulatedAmount = 0;
    uint256 public accumulatedAmountExternal = 0;
    mapping (address => uint256) public buyAmounts;

    address[] public addresses;

    constructor(ERC20 _token, address _wallet, uint256 _exchangeRate, uint256 _minValue, uint256 _maxTotal, uint256 _maxPerAddress, uint256 _startTimestamp, uint256 _endTimestamp) public {
        require(_token != address(0));
        require(_wallet != address(0));
        token = _token;
        wallet = _wallet;
        exchangeRate = _exchangeRate;
        minValue = _minValue;
        maxTotal = _maxTotal;
        maxPerAddress = _maxPerAddress;
        startTimestamp = _startTimestamp;
        endTimestamp = _endTimestamp;
        enabled = false;
    }

    function toggleEnabled() public onlyOwner {
        enabled = !enabled;
        emit ToggleEnabled(enabled);
    }
    event ToggleEnabled(bool _enabled);

    function updateExternalAmount(uint256 _amount) public onlyOwner {
        accumulatedAmountExternal = _amount;
        emit UpdateTotalAmount(accumulatedAmount.add(accumulatedAmountExternal));
    }
    event UpdateTotalAmount(uint256 _totalAmount);

    function () external payable {
        if (msg.sender != wallet) {
            buyTokens();
        }
    }

    function buyTokens() public payable onlyWhitelisted {
        //require(msg.sender != address(0));
        require(enabled);
        require(block.timestamp >= startTimestamp && block.timestamp <= endTimestamp);
        require(msg.value >= minValue);
        require(buyAmounts[msg.sender] < maxPerAddress);
        require(accumulatedAmount.add(accumulatedAmountExternal) < maxTotal);

        uint256 buyAmount;
        uint256 refundAmount;
        (buyAmount, refundAmount) = _calculateAmounts(msg.sender, msg.value);

        if (buyAmounts[msg.sender] == 0) {
            addresses.push(msg.sender);
        }

        accumulatedAmount = accumulatedAmount.add(buyAmount);
        buyAmounts[msg.sender] = buyAmounts[msg.sender].add(buyAmount);
        msg.sender.transfer(refundAmount);
        emit BuyTokens(msg.sender, buyAmount, refundAmount, buyAmount.mul(exchangeRate));
    }
    event BuyTokens(address indexed _addr, uint256 _buyAmount, uint256 _refundAmount, uint256 _tokenAmount);

    function deliver(address _addr) public onlyOwner {
        require(_isEndCollect());
        uint256 amount = buyAmounts[_addr];
        require(amount > 0);
        uint256 tokenAmount = amount.mul(exchangeRate);
        buyAmounts[_addr] = 0;
        token.transfer(_addr, tokenAmount);
        emit Deliver(_addr, tokenAmount);
    }
    event Deliver(address indexed _addr, uint256 _tokenAmount);

    function refund(address _addr) public onlyOwner {
        require(_isEndCollect());
        uint256 amount = buyAmounts[_addr];
        require(amount > 0);
        buyAmounts[_addr] = 0;
        _addr.transfer(amount);
        accumulatedAmount = accumulatedAmount.sub(amount);
        emit Refund(_addr, amount);
    }
    event Refund(address indexed _addr, uint256 _buyAmount);

    function withdrawEth() public onlyOwner {
        wallet.transfer(address(this).balance);
        emit WithdrawEth(wallet, address(this).balance);
    }
    event WithdrawEth(address indexed _addr, uint256 _etherAmount);

    function terminate() public onlyOwner {
        require(getNotDelivered() == address(0));
        token.transfer(wallet, token.balanceOf(address(this)));
        wallet.transfer(address(this).balance);
        emit Terminate(wallet, token.balanceOf(address(this)), address(this).balance);
    }
    event Terminate(address indexed _addr, uint256 _tokenAmount, uint256 _etherAmount);

    function getNotDelivered() public view returns (address) {
        for(uint256 i = 0; i < addresses.length; i++) {
            if (buyAmounts[addresses[i]] != 0) {
                return addresses[i];
            }
        }
        return address(0);
    }

    function _calculateAmounts(address _buyAddress, uint256 _buyAmount) private view returns (uint256, uint256) {
        uint256 buyLimit1 = maxTotal.sub(accumulatedAmount.add(accumulatedAmountExternal));
        uint256 buyLimit2 = maxPerAddress.sub(buyAmounts[_buyAddress]);
        uint256 buyLimit = buyLimit1 > buyLimit2 ? buyLimit2 : buyLimit1;
        uint256 buyAmount = _buyAmount > buyLimit ? buyLimit : _buyAmount;
        uint256 refundAmount = _buyAmount.sub(buyAmount);
        return (buyAmount, refundAmount);
    }

    function _isEndCollect() private view returns (bool) {
        return !enabled && block.timestamp> endTimestamp;
    }
}
