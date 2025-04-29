import random
from oqs import Signature

def generate_random_bits(length):
    return [random.randint(0, 1) for _ in range(length)]

def prepare_qubits(bits, bases):
    return [(bit, base) for bit, base in zip(bits, bases)]

def measure_qubits(qubits, bases):
    return [bit if base == measurement_base else random.randint(0, 1) for (bit, base), measurement_base in zip(qubits, bases)]

def sift_key(sender_bits, sender_bases, receiver_bases):
    return [sender_bits[i] for i in range(len(sender_bits)) if sender_bases[i] == receiver_bases[i]]

def generate_qkd_key(key_length=10):
    alice_bits = generate_random_bits(key_length)
    alice_bases = generate_random_bits(key_length)
    qubits = prepare_qubits(alice_bits, alice_bases)

    bob_bases = generate_random_bits(key_length)
    bob_measurements = measure_qubits(qubits, bob_bases)

    final_key = sift_key(alice_bits, alice_bases, bob_bases)
    return "".join(str(bit) for bit in final_key)

with Signature('Dilithium2') as signer:
    public_key = signer.generate_keypair()
    message = b"secure-transaction"
    signature = signer.sign(message)

    assert signer.verify(message, signature, public_key)
