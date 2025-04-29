
let cachedQuantumNumber = null;
let cachedTime = 0;
export async function getQuantumRandomNumber() {
  const now = Date.now();
  // If we have a cached value that's less than 60 seconds old, return it.
  if (cachedQuantumNumber !== null && now - cachedTime < 60000) {
    return cachedQuantumNumber;
  }
  try {
    const response = await fetch("/quantum/API/jsonI.php?length=1&type=uint8");
    // Read the response as text first.
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (data && Array.isArray(data.data) && data.data.length > 0) {
        cachedQuantumNumber = data.data[0]; // Expected: a number between 0 and 255.
        cachedTime = now;
        return cachedQuantumNumber;
      } else {
        console.error("QRNG API returned JSON without expected 'data' field:", data);
        const fallback = Math.floor(Math.random() * 256);
        cachedQuantumNumber = fallback;
        cachedTime = now;
        return fallback;
      }
    } catch {
      console.error("Invalid JSON from QRNG API:", text);
      const fallback = Math.floor(Math.random() * 256);
      cachedQuantumNumber = fallback;
      cachedTime = now;
      return fallback;
    }
  } catch (error) {
    console.error("Quantum RNG error:", error);
    const fallback = Math.floor(Math.random() * 256);
    cachedQuantumNumber = fallback;
    cachedTime = now;
    return fallback;
  }
}

/**
 * Simulated QKD: Generates a public/private key pair using quantum randomness.
 * Combines the quantum seed with the current timestamp.
 */
export async function generateQuantumKeyPair() {
  const seed = await getQuantumRandomNumber();
  const timestamp = Date.now();
  const publicKey = `pub-${seed}-${timestamp}`;
  const privateKey = `priv-${seed}-${timestamp}`;
  return { publicKey, privateKey };
}

/**
 * Simulated QKD handshake: Receives the client's public key and simulates a key exchange
 * by concatenating it with a dummy server public key, returning a shared secret.
 */
export async function simulateQKD(clientPublicKey) {
  const serverPublicKey = "server-pub-123456"; // Dummy server public key for simulation.
  const sharedSecret = clientPublicKey + serverPublicKey;
  return sharedSecret;
}
