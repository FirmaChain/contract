pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/math/SafeMath.sol";

contract Poc {
    using SafeMath for uint256;
    mapping (uint256 => bool) public hasChild;
    mapping (uint256 => uint256) public parentContract;
    mapping (uint256 => address[]) public parties;
    mapping (uint256 => uint256[]) public hashes;
    mapping (uint256 => string[]) public extraData;
    mapping (uint256 => uint256) public signProgress;
    mapping (uint256 => uint256) public expireBlockNumbers;
    mapping (uint256 => bool) public approvals;

    constructor() public {
    }

    function getContractHistory(uint256 _contractId) public view returns (uint256[]) {
        uint256 _nowContractId = _contractId;
        uint256 _historySize = 1;
        while(parentContract[_nowContractId] != 0) {
            _historySize = _historySize.add(1);
            _nowContractId = parentContract[_nowContractId];
        }
        uint256[] memory history = new uint256[](_historySize);
        _nowContractId = _contractId;
        for (uint256 i = 0; i < _historySize; i++) {
            history[_historySize - i - 1] = _nowContractId;
            _nowContractId = parentContract[_nowContractId];
        }
        return history;
    }

    function getRootContract(uint256 _contractId) public view returns (uint256) {
        uint256[] memory history = getContractHistory(_contractId);
        return history[0];
    }

    function isExpiredContract(uint256 _contractId) public view returns (bool) {
        return block.number > expireBlockNumbers[_contractId];
    }

    function getParties(uint256 _contractId) public view returns (address[]) {
        uint256 _rootContractId = getRootContract(_contractId);
        return parties[_rootContractId];
    }

    function getHashes(uint256 _contractId) public view returns (uint256[]) {
        return hashes[_contractId];
    }

    // getStatus
    // 2 : Closed (which has child contract)
    // 1 : Approved
    // 0 : Wait to sign
    // -1 : Expired or nullified
    function getStatus(uint256 _contractId) public view returns (int) {
        if (hasChild[_contractId]) {
            return 2;
        } else if (approvals[_contractId]) { // approvals[_contractId]
            return 1;
        } else if (isExpiredContract(_contractId)) { // isExpiredContract(_contractId) && !approvals[_contractId]
            return -1;
        } else { // !isExpiredContract(_contractId) && !approvals[_contractId]
            return 0;
        }
    }

    function newContract(uint256 _contractId, address[] _parties, uint256 _lifetime) public { 
        require(_lifetime > 0);
        require(_parties.length > 1 && _parties.length < 1000);
        require(_checkDistinctParties(_parties));
        if (getStatus(_contractId) == -1) {
            bool overwrited = expireBlockNumbers[_contractId] != 0;
            hasChild[_contractId] = false; // NOTE: actually meaningless code; it is always false if reaching here
            parentContract[_contractId] = 0;
            parties[_contractId] = _parties;
            hashes[_contractId] = new uint256[](_parties.length);
            extraData[_contractId] = new string[](_parties.length);
            signProgress[_contractId] = 0;
            expireBlockNumbers[_contractId] = block.number.add(_lifetime);
            emit NewContract(_contractId, msg.sender, _parties, _lifetime, overwrited);
        } else {
            require(false);
        }
    }
    event NewContract(uint256 indexed _contractId, address indexed _creator, address[] _parties, uint256 _lifetime, bool _overwrite);

    function newSubContract(uint256 _contractId, uint256 _parentContractId, uint256 _lifetime) public {
        require(_lifetime > 0);
        if (getStatus(_contractId) == -1) {
            bool exist;
            uint256 index;
            (exist, index) = _getIndexOfParty(_parentContractId, msg.sender);
            require(exist);
            bool overwrited = expireBlockNumbers[_contractId] != 0;
            hasChild[_parentContractId] = true;
            parentContract[_contractId] = _parentContractId;
            address[] memory rootParties = getParties(_parentContractId);
            //parties[_contractId] = _parties;
            hashes[_contractId] = new uint256[](rootParties.length);
            extraData[_contractId] = new string[](rootParties.length);
            signProgress[_contractId] = 0;
            expireBlockNumbers[_contractId] = block.number.add(_lifetime);
            emit NewSubContract(_contractId, msg.sender, _parentContractId, _lifetime, overwrited);
        } else {
            require(false);
        }
    }
    event NewSubContract(uint256 indexed _contractId, address indexed _creator, uint256 indexed _parentContractId, uint256 _lifetime, bool _overwrite);

    function signContract(uint256 _contractId, uint256 _signedHash, string _extraData) public {
        address[] memory rootParties = getParties(_contractId);
        require(getStatus(_contractId) == 0);
        require(signProgress[_contractId] < rootParties.length);
        bool exist;
        uint256 index;
        (exist, index) = _getIndexOfParty(_contractId, msg.sender);
        require(exist);
        require(hashes[_contractId][index] == 0);
        hashes[_contractId][index] = _signedHash;
        extraData[_contractId][index] = _extraData;
        signProgress[_contractId] = signProgress[_contractId].add(1);
        emit SignContract(_contractId, msg.sender, _signedHash);
        if (signProgress[_contractId] == rootParties.length) {
            uint256 commonHash = hashes[_contractId][0];
            bool approval = true;
            for(uint256 i = 1; i < hashes[_contractId].length; i++) {
                if (commonHash != hashes[_contractId][i]) {
                    approval = false;
                    expireBlockNumbers[_contractId] = 1;
                    emit NullifyContract(_contractId, rootParties[i]);
                    break;
                }
            }
            approvals[_contractId] = approval;
            if (approval) {
                emit ApproveContract(_contractId);
            }
        }
    }
    event SignContract(uint256 indexed _contractId, address indexed _signer, uint256 _signedHash);
    event NullifyContract(uint256 indexed _contractId, address _defector);
    event ApproveContract(uint256 indexed _contractId);

    function _getIndexOfParty(uint256 _contractId, address _addr) private view returns (bool, uint256) {
        address[] memory rootParties = getParties(_contractId);
        for(uint256 i = 0; i < rootParties.length; i++) {
            if (rootParties[i] == _addr) {
                return (true, i);
            }
        }
        return (false, 0);
    }

    function _checkDistinctParties(address[] _parties) private pure returns (bool) {
        for (uint256 i = 0; i < _parties.length; i++) {
            for (uint256 j = i + 1; j < _parties.length; j++) {
                if (_parties[i] == _parties[j]) {
                    return false;
                }
            }
        }
        return true;
    }
}
