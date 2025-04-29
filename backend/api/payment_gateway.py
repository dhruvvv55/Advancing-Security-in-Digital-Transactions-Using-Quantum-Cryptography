from web3 import Web3
import json
import os

# ✅ Connect to Local Hardhat Node
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))

# ✅ Replace with Your Deployed Smart Contract Address
contract_address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"  # 🔥 REPLACE WITH YOUR DEPLOYED ADDRESS

# ✅ Load Correct ABI File Path (Outside Backend Directory)
project_root = os.path.dirname(os.path.dirname(__file__))  # Go up one level
abi_path = os.path.join(project_root, "blockchain", "artifacts", "contracts", "SecurePayments.sol", "SecurePayments.json")

# ✅ Load Smart Contract ABI
try:
    with open(abi_path, "r") as f:
        contract_abi = json.load(f)["abi"]
except FileNotFoundError:
    raise FileNotFoundError(f"ABI file not found at {abi_path}. Ensure contract is compiled.")

# ✅ Initialize Contract Instance
contract = w3.eth.contract(address=contract_address, abi=contract_abi)

# ✅ Function to Store Transactions on Blockchain
def store_transaction_on_blockchain(amount, method, status):
    amount = int(amount)  # ✅ Convert float to integer
    tx_hash = contract.functions.storeTransaction(amount, method, status).transact({"from": w3.eth.accounts[0]})
    w3.eth.wait_for_transaction_receipt(tx_hash)
    return tx_hash.hex()

