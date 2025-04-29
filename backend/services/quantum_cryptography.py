from quantum_simulation.bb84_simulation import bb84_key_exchange
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import os

# ✅ Quantum Secure AES Encryption
def encrypt_transaction(data):
    key = bb84_key_exchange()[:16].encode()  # Use first 16 chars for AES key
    iv = os.urandom(16)  # Random IV for AES-GCM

    cipher = Cipher(algorithms.AES(key), modes.GCM(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(data.encode()) + encryptor.finalize()

    return {
        "ciphertext": ciphertext.hex(),
        "iv": iv.hex(),
        "tag": encryptor.tag.hex()
    }

# ✅ Quantum Secure AES Decryption
def decrypt_transaction(encrypted_data):
    key = bb84_key_exchange()[:16].encode()
    iv = bytes.fromhex(encrypted_data["iv"])
    tag = bytes.fromhex(encrypted_data["tag"])
    ciphertext = bytes.fromhex(encrypted_data["ciphertext"])

    cipher = Cipher(algorithms.AES(key), modes.GCM(iv, tag), backend=default_backend())
    decryptor = cipher.decryptor()
    decrypted_data = decryptor.update(ciphertext) + decryptor.finalize()

    return decrypted_data.decode()

if __name__ == "__main__":
    test_data = "Transaction: 1000 INR to Merchant X"
    encrypted = encrypt_transaction(test_data)
    print("🔒 Encrypted:", encrypted)
    decrypted = decrypt_transaction(encrypted)
    print("🔓 Decrypted:", decrypted)
