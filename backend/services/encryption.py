from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import os
import base64
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def encrypt_password(password: str, key: bytes = None):
    """
    Encrypts a password using AES-GCM.
    Returns the encrypted password (ciphertext + tag), nonce, and encryption key.
    """
    if key is None:
        key = os.urandom(32)  # Generate a 256-bit key if not provided

    nonce = os.urandom(12)  # Generate a 96-bit nonce
    cipher = Cipher(algorithms.AES(key), modes.GCM(nonce), backend=default_backend())
    encryptor = cipher.encryptor()

    ciphertext = encryptor.update(password.encode()) + encryptor.finalize()
    tag = encryptor.tag
    encrypted_data = ciphertext + tag

    # Return base64-encoded values for easy storage
    return {
        "ciphertext": base64.b64encode(ciphertext).decode(),
        "nonce": base64.b64encode(nonce).decode(),
        "key": base64.b64encode(key).decode()             # Encryption key
    }

def decrypt_password(encrypted_password: str, nonce: str, key: str):
    """
    Decrypts a password using AES-GCM.
    Returns the decrypted password as a string.
    """
    # Decode base64-encoded inputs
    encrypted_password = base64.b64decode(encrypted_password)
    nonce = base64.b64decode(nonce)
    key = base64.b64decode(key)

    # Split the encrypted password into ciphertext and tag
    ciphertext = encrypted_password[:-16]  # All except the last 16 bytes
    tag = encrypted_password[-16:]         # Last 16 bytes are the tag

    # Create AES-GCM cipher
    cipher = Cipher(algorithms.AES(key), modes.GCM(nonce, tag), backend=default_backend())
    decryptor = cipher.decryptor()

    # Decrypt the password
    plaintext = decryptor.update(ciphertext) + decryptor.finalize()

    return plaintext.decode()

def hash_password(password: str) -> str:
    """
    Hashes a password using bcrypt.
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against a hashed password.
    """
    return pwd_context.verify(plain_password, hashed_password)