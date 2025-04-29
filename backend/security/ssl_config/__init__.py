import os

# ✅ Define SSL Certificate and Key Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SSL_CERT_FILE = os.path.join(BASE_DIR, "cert.pem")
SSL_KEY_FILE = os.path.join(BASE_DIR, "key.pem")

# ✅ Check if SSL files exist
if not os.path.exists(SSL_CERT_FILE) or not os.path.exists(SSL_KEY_FILE):
    raise FileNotFoundError("SSL certificate or key file not found! Ensure cert.pem and key.pem exist.")
