// ✅ Solidity Smart Contract for Secure Transactions
pragma solidity ^0.8.0;

contract SecurePayments {
    struct Transaction {
        uint256 amount;
        string paymentMethod;
        string status;
        uint256 timestamp;
    }

    mapping(address => Transaction[]) public transactions;

    // ✅ Function to Store Payment Data on Blockchain
    function storeTransaction(uint256 _amount, string memory _method, string memory _status) public {
        transactions[msg.sender].push(Transaction(_amount, _method, _status, block.timestamp));
    }

    // ✅ Get User Transactions
    function getTransactions(address _user) public view returns (Transaction[] memory) {
        return transactions[_user];
    }
}
