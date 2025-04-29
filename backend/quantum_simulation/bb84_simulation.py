import random

# ✅ Function to Simulate BB84 Quantum Key Distribution
def bb84_key_exchange():
    key_length = 128  # 128-bit encryption
    alice_bits = [random.randint(0, 1) for _ in range(key_length)]
    alice_bases = [random.choice(["+", "x"]) for _ in range(key_length)]

    bob_bases = [random.choice(["+", "x"]) for _ in range(key_length)]
    bob_measurements = [
        alice_bits[i] if alice_bases[i] == bob_bases[i] else random.randint(0, 1)
        for i in range(key_length)
    ]

    # ✅ Generate Final Secure Key
    secure_key = [alice_bits[i] for i in range(key_length) if alice_bases[i] == bob_bases[i]]
    return "".join(map(str, secure_key))

if __name__ == "__main__":
    print("Simulated Quantum Secure Key:", bb84_key_exchange())
