import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import "../styles/style.css";

// Import your QR code component
import UpiQrCode from "../components/UpiQrCode";

const PaymentForm = ({ paymentMethod, amount }) => {
  // Card Payment States
  const [cardNumber, setCardNumber] = useState(["", "", "", ""]);
  const [cardHolder, setCardHolder] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [cvvVisible, setCvvVisible] = useState(true);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [processingOtp, setProcessingOtp] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Netbanking States
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");

  // UPI States
  const [upiID, setUpiID] = useState("");
  const [showUpiSuggestions, setShowUpiSuggestions] = useState(false);
  const upiSuggestions = ["oksbi", "okaxis", "okicici", "okhdfcbank"];

  const navigate = useNavigate();

  // ─────────────────────────────────────────────────────────────
  // Fetch Bank List for Netbanking
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (paymentMethod === "netbanking") {
      fetch(`${API_BASE_URL}/banks/list`)
        .then((response) => response.json())
        .then((data) => setBanks(data.banks || []))
        .catch((error) => console.error("Error fetching banks:", error));
    }
  }, [paymentMethod]);

  // ─────────────────────────────────────────────────────────────
  // CARD NUMBER HANDLING (4 separate boxes)
  // ─────────────────────────────────────────────────────────────
  const handleCardNumberChange = (index, e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    const newCardNumber = [...cardNumber];
    newCardNumber[index] = value;
    setCardNumber(newCardNumber);

    // Auto-focus to the next input if 4 digits are entered
    if (value.length === 4 && index < 3) {
      const nextInput = document.getElementById(`card-input-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // ─────────────────────────────────────────────────────────────
  // EXPIRY DATE HANDLING (Separate MM and YY boxes)
  // ─────────────────────────────────────────────────────────────
  const handleExpiryMonthChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 2);
    setExpiryMonth(value);
  };

  const handleExpiryYearChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 2);
    setExpiryYear(value);
  };

  const isExpiryValid = () => {
    if (expiryMonth.length !== 2 || expiryYear.length !== 2) return false;
    const mm = parseInt(expiryMonth, 10);
    const yy = parseInt(expiryYear, 10);
    if (mm < 1 || mm > 12) return false;
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    return yy > currentYear || (yy === currentYear && mm >= currentMonth);
  };

  // ─────────────────────────────────────────────────────────────
  // CVV HANDLING
  // ─────────────────────────────────────────────────────────────
  const handleCvvChange = (e) => {
    const input = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCvv(input);
    setCvvVisible(true);
    setTimeout(() => setCvvVisible(false), 2000);
  };

  // ─────────────────────────────────────────────────────────────
  // UPI HANDLING
  // ─────────────────────────────────────────────────────────────
  const handleUpiChange = (e) => {
    const value = e.target.value;
    setUpiID(value);
    if (value.includes("@")) {
      setShowUpiSuggestions(true);
    } else {
      setShowUpiSuggestions(false);
    }
  };

  const handleUpiSuggestionClick = (suffix) => {
    const atIndex = upiID.indexOf("@");
    if (atIndex !== -1) {
      const prefix = upiID.slice(0, atIndex + 1);
      setUpiID(prefix + suffix);
    }
    setShowUpiSuggestions(false);
  };

  // ─────────────────────────────────────────────────────────────
  // SEND OTP (for Card Payment)
  // ─────────────────────────────────────────────────────────────
  const sendOtp = async () => {
    if (cardNumber.join("").length !== 16) {
      alert("Invalid Card Number");
      return;
    }

    setProcessingOtp(true);
    try {
      const response = await fetch(`${API_BASE_URL}/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_number: cardNumber.join("") }),
      });

      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        setMobileNumber(data.mobile);
        alert(`OTP sent to registered mobile: ${data.mobile}`);
      } else {
        alert(data.detail || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Error sending OTP");
    } finally {
      setProcessingOtp(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // VERIFY OTP
  // ─────────────────────────────────────────────────────────────
  const verifyOtp = async () => {
    if (!otp) {
      alert("Enter OTP to verify");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_number: cardNumber.join(""), otp }),
      });

      const data = await response.json();
      if (response.ok) {
        setOtpVerified(true);
        alert("OTP verified successfully! Proceeding to payment.");
      } else {
        alert(data.detail || "Invalid OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Error verifying OTP");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // PROCESS PAYMENT
  // ─────────────────────────────────────────────────────────────
  const handlePayment = async () => {
    // Card Payment Validations
    if (paymentMethod === "card") {
      if (!isExpiryValid()) {
        alert("Invalid expiry date (MM/YY).");
        return;
      }
      if (!otpVerified) {
        alert("Please verify OTP before proceeding.");
        return;
      }
    }

    // Netbanking Validation
    if (paymentMethod === "netbanking" && !selectedBank) {
      alert("Please select a bank.");
      return;
    }

    // UPI Validation
    if (paymentMethod === "upi") {
      if (!upiID || !upiID.includes("@")) {
        alert("Please enter a valid UPI ID.");
        return;
      }

      // UPI Deep Link for Mobile Devices
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      if (isMobile) {
        const payeeName = "Demo Merchant";
        const transactionNote = "Demo Payment";
        const amountFormatted = parseFloat(amount).toFixed(2);
        const gpayUrl = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(
          payeeName
        )}&tn=${encodeURIComponent(transactionNote)}&am=${amountFormatted}&cu=INR`;

        window.location.href = gpayUrl;
        return;
      } else {
        alert(
          "UPI deep link only works on mobile. Please scan the QR code below with your phone."
        );
        return;
      }
    }

    // Build Payment Data
    let paymentData = {
      amount: Math.floor(amount),
      payment_method: paymentMethod,
    };

    if (paymentMethod === "card") {
      paymentData = {
        ...paymentData,
        card_number: cardNumber.join(""),
        expiry: `${expiryMonth}/${expiryYear}`,
        cvv: cvv,
      };
    } else if (paymentMethod === "netbanking") {
      paymentData.bank = selectedBank;
    } else if (paymentMethod === "upi") {
      paymentData.upi_id = upiID;
    }

    setProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/payments/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();
      if (response.ok) {
        navigate("/success");
      } else {
        alert(data.detail || "Payment failed");
      }
    } catch (error) {
      alert("Payment Failed: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-form">
      {/* CARD PAYMENT SECTION */}
      {paymentMethod === "card" && (
        <div className="card-payment">
          <h2>Enter Card Details</h2>
          <div className="card-number-inputs">
            {cardNumber.map((num, index) => (
              <input
                key={index}
                id={`card-input-${index}`}
                type="text"
                placeholder="XXXX"
                value={num}
                onChange={(e) => handleCardNumberChange(index, e)}
                maxLength="4"
                className="card-number-box"
              />
            ))}
          </div>
          <input
            type="text"
            placeholder="Cardholder Name"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
          />
          <div className="card-expiry">
            <input
              type="text"
              placeholder="MM"
              value={expiryMonth}
              onChange={handleExpiryMonthChange}
              maxLength="2"
            />
            <span>/</span>
            <input
              type="text"
              placeholder="YY"
              value={expiryYear}
              onChange={handleExpiryYearChange}
              maxLength="2"
            />
          </div>
          <input
            type={cvvVisible ? "text" : "password"}
            placeholder="CVV ***"
            value={cvv}
            onChange={handleCvvChange}
            maxLength="3"
          />
          {otpSent ? (
            <div className="otp-section">
              <h3>Enter OTP</h3>
              <p>OTP sent to {mobileNumber}</p>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
              />
              <button onClick={verifyOtp} disabled={otpVerified}>
                {otpVerified ? "OTP Verified" : "Verify OTP"}
              </button>
            </div>
          ) : (
            <button className="otp-button" onClick={sendOtp} disabled={processingOtp}>
              {processingOtp ? "Sending OTP..." : "Send OTP"}
            </button>
          )}
        </div>
      )}

      {/* NET BANKING SECTION */}
      {paymentMethod === "netbanking" && (
        <div className="netbanking-payment">
          <h2>Select Your Bank</h2>
          <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}>
            <option value="">-- Select Bank --</option>
            {banks.map((bank, index) => (
              <option key={index} value={bank}>
                {bank}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* UPI SECTION */}
      {paymentMethod === "upi" && (
        <div className="upi-payment">
          <h2>Enter UPI ID</h2>
          <input
            type="text"
            placeholder="e.g., user@upi"
            value={upiID}
            onChange={handleUpiChange}
          />
          {showUpiSuggestions && (
            <ul className="upi-suggestions">
              {upiSuggestions.map((suffix) => (
                <li key={suffix} onClick={() => handleUpiSuggestionClick(suffix)}>
                  {upiID.split("@")[0]}@{suffix}
                </li>
              ))}
            </ul>
          )}
          <div style={{ marginTop: "20px" }}>
            <UpiQrCode upiID={upiID} amount={amount} />
          </div>
        </div>
      )}

      <button className="pay-button" onClick={handlePayment} disabled={processing}>
        {processing ? "Processing..." : "Proceed to Pay"}
      </button>
    </div>
  );
};

PaymentForm.propTypes = {
  paymentMethod: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
};

export default PaymentForm;
