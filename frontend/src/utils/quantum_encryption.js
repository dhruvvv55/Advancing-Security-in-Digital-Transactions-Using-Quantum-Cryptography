// src/utils/quantum_encryption.js
import CryptoJS from "crypto-js";
import { getQuantumRandomNumber } from "./quantum_utils";

// Function to encrypt data using a key derived from quantum randomness
export async function encryptPaymentData(data) {
  const quantumKey = await getQuantumRandomNumber(); // Get a quantum random number
  // Convert it to a string key (for demo purposes)
  const key = CryptoJS.enc.Utf8.parse(quantumKey.toString());
  // Encrypt the data (convert data to JSON string)
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return ciphertext.toString();
}

// Decryption would be similar (if needed for demonstration)
export async function decryptPaymentData(ciphertext, quantumKey) {
  const key = CryptoJS.enc.Utf8.parse(quantumKey.toString());
  const bytes = CryptoJS.AES.decrypt(ciphertext, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedData);
}
