# Advancing Security in Digital Transactions Using Quantum Cryptography

This project is the implementation companion to our research paper:  
**“Advancing Security in Digital Transactions Using Quantum Cryptography” (JISEM, 2025)**.

It presents a **quantum-secured payment framework** that integrates **Quantum Key Distribution (QKD)**, **AI-driven fraud detection**, and **Blockchain-based immutability** to protect against both classical and quantum-enabled cyberattacks.

---

## 🔒 Problem Statement
With the rise of **quantum computing**, traditional cryptographic methods like RSA and ECC are becoming increasingly vulnerable.  
To ensure future-proof financial security, this project explores **quantum cryptography** as a practical solution for securing online transactions.

---

## 🚀 Features
- **Quantum Key Distribution (QKD)** – Uses BB84 protocol to establish unbreakable encryption keys.
- **Post-Quantum Security** – Resistant to Shor’s algorithm and quantum attacks.
- **AI-Based Fraud Detection** – Implements ML models (Random Forest, LSTM) for anomaly detection and risk assessment.
- **Blockchain Integration** – Ensures transaction transparency and immutability.
- **Secure Authentication** – MFA, biometric login, and digital signatures.
- **Performance Monitoring** – Evaluates key metrics: QBER, key generation rate, fraud detection accuracy, and processing latency.

---

## 🛠️ Tech Stack
### Backend
- **Python 3**, FastAPI  
- Quantum simulation module (QKD – BB84)  
- AI fraud detection (LSTM, Random Forest)  
- Blockchain transaction module  
- Dockerized deployment  

### Frontend
- React + Vite  
- REST API integration  
- Modern UI for transaction monitoring and fraud alerts  

---

## 📂 System Architecture
The framework is structured into six layers:
1. **User Interface Layer** – Web/mobile apps with MFA & biometric authentication.  
2. **Application Server Layer** – Routes user requests and validates credentials.  
3. **Quantum Cryptographic Module (QCM)** – Executes QKD-based secure key distribution.  
4. **Transaction Processing Unit** – Validates and executes transactions.  
5. **AI Fraud Detection** – Identifies anomalies using ML models.  
6. **Blockchain Ledger** – Stores tamper-proof transaction records.  

---

## ⚡ Installation & Setup

### 1) Clone Repository
```bash
git clone https://github.com/your-username/Advancing-Security-in-Digital-Transactions-Using-Quantum-Cryptography.git
cd Advancing-Security-in-Digital-Transactions-Using-Quantum-Cryptography
```

### 2) Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows (PowerShell): .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
Backend runs at: http://localhost:8000
```

### 3) Frontend Setup
```bash
cd frontend
npm install
npm run dev
Frontend runs at: http://localhost:5173
```

---

📊 Key Performance Highlights

- QKD vs RSA → 4x faster key generation with 0.8% QBER.

- AI Fraud Detection → LSTM model achieved 95.8% accuracy with 1.2% false positives.

- Blockchain Security → Ensures tamper-proof ledger for payments.

- Transaction Time → ~4.5 sec (quantum-secured) vs ~2 sec (RSA), trading slight latency for future-proof security.

---

🧪 Running Tests
```bash
cd backend
pytest tests/
```
---

📌 Roadmap

 - Integration of Post-Quantum Cryptographic (PQC) algorithms (e.g., Kyber, NTRU).
 
 - Development of Quantum Blockchain for scalable decentralized payments.
 
 - AI-driven adaptive QKD optimization.
 
 - Cloud deployment with Kubernetes.

---

📜 Research Reference

Advancing Security in Digital Transactions Using Quantum Cryptography

📖 [Read the full paper here]([https://ijarsct.co.in/Paper19379.pdf](https://jisem-journal.com/index.php/journal/article/view/9214/4252)).

---

🤝 Contributing

Contributions are welcome! Please fork the repo and submit a pull request. For major updates, open an issue first to discuss the changes.
