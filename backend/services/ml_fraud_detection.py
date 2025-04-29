import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
import os

# Get the absolute path of the current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "fraud_detection_model.pkl")


def train_fraud_detection_model():
    """
    Train a simple fraud detection model and save it.
    """
    # Sample training data (Replace this with real data)
    data = {
        "amount": [100, 5000, 12000, 200, 7500, 30000],
        "payment_method": [0, 1, 1, 0, 2, 2],  # (0: Card, 1: UPI, 2: NetBanking)
        "is_fraud": [0, 1, 1, 0, 1, 1]  # (0: Legitimate, 1: Fraud)
    }

    df = pd.DataFrame(data)

    # Features & Labels
    X = df[["amount", "payment_method"]]
    y = df["is_fraud"]

    # Train Model
    model = RandomForestClassifier(n_estimators=50, random_state=42)
    model.fit(X, y)

    # Save Model
    joblib.dump(model, MODEL_PATH)
    print(f"✅ Fraud detection model saved at {MODEL_PATH}")

def load_fraud_detection_model():
    """
    Load trained fraud detection model.
    """
    try:
        model = joblib.load(MODEL_PATH)
        return model
    except FileNotFoundError:
        print("🚨 Fraud detection model not found. Training a new model...")
        train_fraud_detection_model()
        return joblib.load(MODEL_PATH)

# ✅ Load the Model
fraud_model = load_fraud_detection_model()

def detect_fraud(transaction_data):
    """
    Predict whether a transaction is fraudulent.
    :param transaction_data: Dictionary with "amount" and "payment_method".
    :return: True (fraud) or False (legitimate)
    """
    try:
        features = np.array([[transaction_data["amount"], transaction_data["payment_method"]]])
        prediction = fraud_model.predict(features)
        return bool(prediction[0])
    except Exception as e:
        print(f"🚨 Error detecting fraud: {str(e)}")
        return False
