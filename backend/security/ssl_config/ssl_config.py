import os

# ✅ Define SSL Certificate & Key Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SSL_CERT_FILE = os.path.join(BASE_DIR, "cert.pem")
SSL_KEY_FILE = os.path.join(BASE_DIR, "key.pem")
