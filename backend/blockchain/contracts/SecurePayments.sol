// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract SecurePayments {
    struct Transaction {
        uint256 amount;
        string paymentMethod;
        string status;
        uint256 timestamp;
    }

    mapping(address => Transaction[]) public transactions;

    // ✅ PQ Signatures Storage
    mapping(address => bytes[]) public pqSignatures;

    // ✅ Store Payment Data
    function storeTransaction(
        uint256 _amount,
        string memory _method,
        string memory _status
    ) public {
        transactions[msg.sender].push(
            Transaction(_amount, _method, _status, block.timestamp)
        );
    }

    // ✅ Get User Transactions
    function getTransactions(address _user) public view returns (Transaction[] memory) {
        return transactions[_user];
    }

    // ✅ Store PQ Signature for a User (must match transaction index)
    function storePQSignature(bytes memory signature) public {
        pqSignatures[msg.sender].push(signature);
    }

    // ✅ Retrieve PQ Signature by Index
    function getPQSignature(address user, uint index) public view returns (bytes memory) {
        return pqSignatures[user][index];
    }
}
