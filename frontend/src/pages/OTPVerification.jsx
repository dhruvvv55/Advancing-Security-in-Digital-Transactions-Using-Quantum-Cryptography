import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/style.css";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const OTPVerification = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [transactionAmount, setTransactionAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch stored payment details when component mounts.
  useEffect(() => {
    if (location.state && location.state.mobileNumber && location.state.transactionId) {
      console.log("Received from state:", location.state);
      setTransactionId(location.state.transactionId);
      setMobileNumber(location.state.mobileNumber);
      if (location.state.transaction_amount) {
        setTransactionAmount(location.state.transaction_amount);
      }
    } else {
      const storedDetails = JSON.parse(localStorage.getItem("paymentDetails"));
      if (storedDetails?.transaction_id && storedDetails?.mobile_number) {
        setTransactionId(storedDetails.transaction_id);
        setMobileNumber(storedDetails.mobile_number);
        if (storedDetails.transaction_amount) {
          setTransactionAmount(storedDetails.transaction_amount);
        }
      } else {
        setError("❌ Invalid payment details. Please try again.");
      }
    }
  }, [location]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  // Helper: Ensure transactionId is a string.
  const validTransactionId =
    transactionId && typeof transactionId === "object" && transactionId.transaction_id
      ? transactionId.transaction_id
      : String(transactionId || "");

  // Format seconds into mm:ss
  const formatTime = (seconds) => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // Handle OTP input changes.
  const handleChange = (element, index) => {
    if (element.value !== "" && !/^\d$/.test(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value !== "" && index < 5 && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  // After a successful OTP verification, construct orderDetails that now include the purchased items.
  const handleOTPVerificationSuccess = () => {
    // Retrieve stored payment details (saved earlier in Payment.jsx)
    const paymentData = JSON.parse(localStorage.getItem("paymentDetails"));
    // Retrieve purchased items that the user ordered (ensure Payment.jsx saves these!)
    const purchasedItems = JSON.parse(localStorage.getItem("purchasedItems")) || [];
    const orderDetails = {
      // Instead of printing an order ID we now pass the list of items the user ordered.
      items: purchasedItems,
      transactionId: paymentData?.transaction_id || validTransactionId,
      deliveryDate: paymentData?.deliveryDate || null,
    };
    // Save the orderDetails for a fallback in Success.jsx.
    localStorage.setItem("orderDetails", JSON.stringify(orderDetails));
    navigate("/success", { state: { orderDetails } });
  };

  // Handle OTP verification.
  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Invalid OTP. Please enter a 6-digit OTP.");
      return;
    }
    if (!validTransactionId || !mobileNumber) {
      setError("❌ Missing mobile number or transaction ID. Please try again.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      console.log(`Verifying OTP for Transaction: ${validTransactionId}, Mobile: ${mobileNumber}`);
      const response = await fetch(`${API_BASE_URL}/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_id: validTransactionId,
          mobile_number: mobileNumber,
          otp: otpString,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("✅ OTP Verified Successfully.");
        setTimeout(() => {
          handleOTPVerificationSuccess();
        }, 2000); // 2-second delay
      } else {
        console.error("❌ OTP Verification Failed:", data);
        setError(typeof data.detail === "string" ? data.detail : "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("⚠️ Error verifying OTP:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP function.
  const resendOTP = async () => {
    setError("");
    setLoading(true);
    try {
      const payload = {
        mobile_number: mobileNumber,
        transaction_id: validTransactionId,
      };
      console.log("Resend OTP Payload:", payload);
      const response = await fetch(`${API_BASE_URL}/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to resend OTP.");
      }
      setOtp(new Array(6).fill(""));
      console.log("✅ OTP Resent Successfully.");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-verification-container">
      <h1>Enter your Verification Code</h1>
      <p>We have sent a One Time Passcode (OTP) to: {mobileNumber}</p>
      {transactionAmount > 0 && <p>Transaction Amount: ₹{transactionAmount}</p>}
      <p>Time remaining: {formatTime(timeLeft)}</p>

      {loading && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}

      <div className="otp-inputs">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            name="otp"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e.target, index)}
            onFocus={(e) => e.target.select()}
            className="otp-box"
          />
        ))}
      </div>

      {error && <p className="error">{error}</p>}

      <button className="button" onClick={handleVerify} disabled={loading || otp.join("").length !== 6}>
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      <p className="resend-link">
        Didn&apos;t get it?{" "}
        <span
          onClick={resendOTP}
          style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
        >
          Resend code
        </span>
      </p>
    </div>
  );
};

export default OTPVerification;
