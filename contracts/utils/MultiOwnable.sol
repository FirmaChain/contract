pragma solidity ^0.4.23;

contract MultiOwnable {
    mapping (address => bool) owners;
    address unremovableOwner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event OwnershipExtended(address indexed host, address indexed guest);
    event OwnershipRemoved(address indexed removedOwner);

    modifier onlyOwner() {
        require(owners[msg.sender]);
        _;
    }

    constructor() public {
        owners[msg.sender] = true;
        unremovableOwner = msg.sender;
    }

    function addOwner(address guest) onlyOwner public {
        require(guest != address(0));
        owners[guest] = true;
        emit OwnershipExtended(msg.sender, guest);
    }

    function removeOwner(address removedOwner) onlyOwner public {
        require(removedOwner != address(0));
        require(unremovableOwner != removedOwner);
        delete owners[removedOwner];
        emit OwnershipRemoved(removedOwner);
    }

    function transferOwnership(address newOwner) onlyOwner public {
        require(newOwner != address(0));
        require(unremovableOwner != msg.sender);
        owners[newOwner] = true;
        delete owners[msg.sender];
        emit OwnershipTransferred(msg.sender, newOwner);
    }

    function isOwner(address addr) public view returns(bool){
        return owners[addr];
    }
}
