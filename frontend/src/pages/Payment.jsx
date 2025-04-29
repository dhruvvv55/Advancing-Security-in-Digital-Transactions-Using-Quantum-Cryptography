// Payment.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import PropTypes from "prop-types";
import API_BASE_URL from "../config";
import { fetchBanks, processPayment, fetchMobileNumber } from "../services/paymentService";
import "../styles/style.css";

// Payment Icons
import mastercardIcon from "../assets/mastercard.png";
import upiIcon from "../assets/upi.png";
import netbankingIcon from "../assets/netbanking.png";
import olamoneyIcon from "../assets/olamoney.png";

// UPI QR Code Component
import UpiQrCode from "../components/UpiQrCode";

// Quantum encryption utilities
import { encryptPaymentData } from "../utils/quantum_encryption";
import { generateQuantumKeyPair, simulateQKD } from "../utils/quantum_utils";

// Toast for notifications
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// jsPDF for generating receipts
import jsPDF from "jspdf";

const Payment = ({ cart }) => {
  // Payment method and bank selection states
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [banks, setBanks] = useState([]);

  // Card payment states
  const [cardNumber, setCardNumber] = useState(["", "", "", ""]);
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardExpiryMonth, setCardExpiryMonth] = useState("");
  const [cardExpiryYear, setCardExpiryYear] = useState("");
  const [cardCVV, setCardCVV] = useState("");

  // UPI state
  const [upiID, setUpiID] = useState("");

  // Processing state for spinner overlay and disabling buttons
  const [processing, setProcessing] = useState(false);

  // Order totals and shipping
  const [subtotal, setSubtotal] = useState(0);
  const shippingCost = 0;

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState({
    name: "MS Dhoni",
    address: "123 Main St",
    city: "Ranchi",
    postalCode: "840996",
    country: "India",
  });
  const [showAddressEditor, setShowAddressEditor] = useState(false);

  // Coupon and discount state
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const navigate = useNavigate();

  // Step indicator states
  const steps = ["Cart", "Shipping", "Payment", "Review"];
  const currentStepIndex = 2;

  // Detect card brand based on entered card number
  const detectCardBrand = (number) => {
    const cleaned = number.replace(/\s/g, "");
    if (cleaned.startsWith("4")) return "Visa";
    if (["51", "52", "53", "54", "55"].includes(cleaned.slice(0, 2))) return "Mastercard";
    return "";
  };
  const cardBrand = detectCardBrand(cardNumber.join(""));

  // Validate card expiry (MM/YY)
  const isCardExpiryValid = () => {
    if (cardExpiryMonth.length !== 2 || cardExpiryYear.length !== 2) return false;
    const month = parseInt(cardExpiryMonth, 10);
    const year = parseInt(cardExpiryYear, 10);
    if (isNaN(month) || isNaN(year)) return false;
    if (month < 1 || month > 12) return false;
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to access the cart!");
      navigate("/login");
      return;
    }
    const cartSubtotal = cart.reduce(
      (acc, item) => acc + item.price * (item.quantity || 1),
      0
    );
    setSubtotal(cartSubtotal);

    fetchBanks()
      .then((data) => {
        console.log("Fetched banks:", data);
        if (data && Array.isArray(data.banks)) {
          setBanks(data.banks);
        } else if (Array.isArray(data)) {
          setBanks(data);
        } else {
          setBanks([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching banks:", error);
        setBanks([]);
      });
  }, [cart, navigate]);

  const totalAmount = subtotal + shippingCost - discount;

  // Coupon application
  const applyCoupon = () => {
    if (coupon === "DISCOUNT100") {
      setDiscount(100);
      toast.success("Coupon applied! ₹100 discount.");
    } else {
      toast.error("Invalid coupon code.");
    }
  };

  // Shipping address editor stub
  const saveAddress = () => {
    setShowAddressEditor(false);
  };

  // Handle card number input (each box)
  const handleCardNumberChange = (index, e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    const newCardNumber = [...cardNumber];
    newCardNumber[index] = value;
    setCardNumber(newCardNumber);
    if (value.length === 4 && index < 3) {
      const nextInput = document.getElementById(`card-input-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Quantum encryption simulation for card payments
  const performQuantumEncryption = async (details) => {
    const { publicKey } = await generateQuantumKeyPair();
    const sharedSecret = await simulateQKD(publicKey);
    console.log("Quantum Handshake Shared Secret:", sharedSecret);
    const encryptedDetails = await encryptPaymentData(details);
    console.log("Encrypted Payment Details:", encryptedDetails);
    return encryptedDetails;
  };

  // Generate a digital receipt using jsPDF
  const generateReceipt = (transactionDetails) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Payment Receipt", 10, 20);
    doc.setFontSize(12);
    doc.text(`Transaction ID: ${transactionDetails.id}`, 10, 30);
    doc.text(`Amount: ₹${transactionDetails.amount}`, 10, 40);
    doc.text(`Date: ${new Date().toLocaleString()}`, 10, 50);
    doc.save("receipt.pdf");
  };

  // Handle payment processing and then navigate to the next step (OTP or Success)
  const handlePayment = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to make a payment!");
      navigate("/login");
      return;
    }

    let paymentDetails = {
      amount: totalAmount,
      payment_method: paymentMethod,
    };

    // CARD PAYMENT with OTP flow
    if (paymentMethod === "card") {
      if (cardNumber.join("").length !== 16) {
        toast.error("Invalid Card Number");
        return;
      }
      if (!isCardExpiryValid()) {
        toast.error("Card is expired or invalid");
        return;
      }
      const mobileNumber = await fetchMobileNumber(cardNumber.join(""), token);
      if (!mobileNumber) {
        toast.error("Failed to fetch registered mobile number. Please check your card details.");
        return;
      }
      paymentDetails = {
        ...paymentDetails,
        card_number: cardNumber.join(""),
        expiry: `${cardExpiryMonth}/${cardExpiryYear}`,
        cvv: cardCVV,
      };
      const encryptedPaymentDetails = await performQuantumEncryption(paymentDetails);
      paymentDetails.encrypted_data = encryptedPaymentDetails;
      toast.info("Quantum Secure Handshake complete.");

      const otpPayload = {
        card_number: cardNumber.join(""),
        mobile_number: mobileNumber,
        transaction_amount: totalAmount.toString(),
        merchant_name: "ShopFusion",
      };
      console.log("OTP Request Payload:", otpPayload);
      try {
        const otpResponse = await fetch(`${API_BASE_URL}/otp/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(otpPayload),
        });
        if (!otpResponse.ok) {
          throw new Error("Failed to send OTP. Please try again.");
        }
        const otpData = await otpResponse.json();
        // Save partial payment details and purchased items to localStorage for OTP flow.
        localStorage.setItem(
          "paymentDetails",
          JSON.stringify({
            order_id: otpData.order_id || "ORD-20250408-001",
            transaction_id: otpData.transaction_id,
            deliveryDate: otpData.deliveryDate || null,
            items: cart, // Save the ordered items
          })
        );
        // Also save the purchased items separately (optional).
        localStorage.setItem("purchasedItems", JSON.stringify(cart));
        toast.success("OTP sent successfully!");
        setTimeout(() => {
          navigate("/bank-redirect", {
            state: { transactionId: otpData.transaction_id, mobileNumber: otpData.mobile_number },
          });
        }, 1500);
      } catch (error) {
        console.error("Error sending OTP:", error);
        toast.error("Could not send OTP. Please try again.");
      }
      return;
    }

    // UPI PAYMENT
    if (paymentMethod === "upi") {
      if (!upiID.includes("@")) {
        toast.error("Invalid UPI ID");
        return;
      }
      paymentDetails.upi_id = upiID;
      if (import.meta.env.VITE_SANDBOX_MODE === "true") {
        toast.info("Sandbox Mode: Simulating UPI transaction...");
        const simulatedOrderDetails = {
          items: cart, // Pass the purchased items instead of an order number.
          transactionId: "SIMULATED_TXN",
          deliveryDate: null,
        };
        setTimeout(() => {
          generateReceipt({ id: simulatedOrderDetails.transactionId, amount: totalAmount });
          localStorage.setItem("orderDetails", JSON.stringify(simulatedOrderDetails));
          navigate("/success", { state: { orderDetails: simulatedOrderDetails } });
        }, 1500);
        return;
      } else {
        toast.info("Please scan the QR code displayed on the screen with your UPI app.");
        return;
      }
    }

    // NETBANKING and other methods
    if (paymentMethod === "netbanking") {
      if (!selectedBank) {
        toast.error("Please select a bank");
        return;
      }
      paymentDetails.bank_code = selectedBank;
    }

    setProcessing(true);
    const response = await processPayment(paymentDetails, token);
    if (response.error) {
      toast.error(response.error);
    } else {
      toast.success("Payment Successful!");
      generateReceipt({ id: response.transaction_id || "N/A", amount: totalAmount });
      const orderDetails = {
        items: cart, // Include the purchased items
        transactionId: response.transaction_id || "N/A",
        deliveryDate: response.deliveryDate || null,
      };
      localStorage.setItem("orderDetails", JSON.stringify(orderDetails));
      navigate("/success", { state: { orderDetails } });
    }
    setProcessing(false);
  };

  return (
    <div className="payment-page">
      {/* Step Indicator */}
      <div className="step-indicator">
        {steps.map((step, idx) => (
          <div key={step} className={`step ${idx <= currentStepIndex ? "active" : ""}`}>
            <span className="step-number">{idx + 1}</span>
            <span className="step-label">{step}</span>
          </div>
        ))}
      </div>

      {/* Spinner Overlay */}
      {processing && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}

      {/* Quantum Handshake UI */}
      {processing && paymentMethod === "card" && (
        <div className="quantum-handshake">
          Initiating Quantum Secure Handshake...
        </div>
      )}

      <div className="payment-page-container">
        {/* Left Column: Order Summary */}
        <div className="payment-left">
          <h2>Order Summary</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p>₹{item.price}</p>
                    <p>Qty: {item.quantity || 1}</p>
                  </div>
                  <p className="cart-item-subtotal">
                    ₹{(item.price * (item.quantity || 1)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Coupon Field */}
          <div className="coupon-field">
            <input
              type="text"
              placeholder="Enter Coupon Code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />
            <button onClick={applyCoupon}>Apply Coupon</button>
          </div>

          {/* Shipping Address */}
          <div className="shipping-address">
            <h4>Shipping Address</h4>
            {showAddressEditor ? (
              <div className="address-editor">
                <input
                  type="text"
                  value={shippingAddress.name}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, name: e.target.value })
                  }
                />
                <input
                  type="text"
                  value={shippingAddress.address}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, address: e.target.value })
                  }
                />
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, city: e.target.value })
                  }
                />
                <input
                  type="text"
                  value={shippingAddress.postalCode}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                  }
                />
                <input
                  type="text"
                  value={shippingAddress.country}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, country: e.target.value })
                  }
                />
                <button onClick={saveAddress}>Save Address</button>
                <button onClick={() => setShowAddressEditor(false)}>Cancel</button>
              </div>
            ) : (
              <div className="address-display">
                <p>{shippingAddress.name}</p>
                <p>
                  {shippingAddress.address}, {shippingAddress.city}
                </p>
                <p>
                  {shippingAddress.postalCode}, {shippingAddress.country}
                </p>
                <button className="button" onClick={() => setShowAddressEditor(true)}>
                  Edit Address
                </button>
              </div>
            )}
          </div>

          {/* Cart Totals */}
          <div className="cart-summary">
            <div className="cart-summary-line">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="cart-summary-line">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="cart-summary-line total">
              <span>Total</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Continue Shopping / Return Buttons */}
          <div className="continue-shopping">
            <Link to="/cart" className="return-cart-button">
              Return to Cart
            </Link>
            <Link to="/" className="continue-button">
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column: Payment Methods */}
        <div className="payment-right">
          <h2>Select Payment Method</h2>
          <div className="payment-methods">
            <button
              onClick={() => setPaymentMethod("card")}
              className={paymentMethod === "card" ? "active" : ""}
            >
              <img src={mastercardIcon} alt="Mastercard" className="payment-icon" />
              Credit/Debit Card
            </button>
            <button
              onClick={() => setPaymentMethod("upi")}
              className={paymentMethod === "upi" ? "active" : ""}
            >
              <img src={upiIcon} alt="UPI" className="payment-icon" />
              UPI
            </button>
            <button
              onClick={() => setPaymentMethod("netbanking")}
              className={paymentMethod === "netbanking" ? "active" : ""}
            >
              <img src={netbankingIcon} alt="Net Banking" className="payment-icon" />
              Net Banking
            </button>
            <button
              onClick={() => setPaymentMethod("wallet")}
              className={paymentMethod === "wallet" ? "active" : ""}
            >
              <img src={olamoneyIcon} alt="Olamoney" className="payment-icon" />
              Olamoney Wallet
            </button>
          </div>

          {/* Payment Form Fields */}
          {paymentMethod === "card" && (
            <div className="payment-form">
              <h3>
                Enter Card Details {cardBrand && <small>({cardBrand})</small>}
              </h3>
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
                placeholder="Card Holder Name"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
              />
              <div className="card-expiry">
                <input
                  type="text"
                  placeholder="MM"
                  value={cardExpiryMonth}
                  onChange={(e) =>
                    setCardExpiryMonth(e.target.value.replace(/\D/g, "").slice(0, 2))
                  }
                  maxLength="2"
                />
                <span>/</span>
                <input
                  type="text"
                  placeholder="YY"
                  value={cardExpiryYear}
                  onChange={(e) =>
                    setCardExpiryYear(e.target.value.replace(/\D/g, "").slice(0, 2))
                  }
                  maxLength="2"
                />
              </div>
              <input
                type="password"
                placeholder="CVV ***"
                value={cardCVV}
                onChange={(e) =>
                  setCardCVV(e.target.value.replace(/\D/g, "").slice(0, 3))
                }
                maxLength="3"
              />
            </div>
          )}

          {paymentMethod === "upi" && (
            <div className="payment-form upi-payment">
              <h3>Enter UPI ID</h3>
              <input
                type="text"
                placeholder="user@upi"
                value={upiID}
                onChange={(e) => setUpiID(e.target.value)}
              />
              <div style={{ marginTop: "20px" }}>
                <UpiQrCode upiID={upiID} amount={totalAmount} />
              </div>
            </div>
          )}

          {paymentMethod === "netbanking" && (
            <div className="payment-form">
              <h3>Select Your Bank</h3>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
              >
                <option value="">-- Select Bank --</option>
                {Array.isArray(banks) &&
                  banks.map((bank) => (
                    <option key={bank.code || bank._id} value={bank.code || bank._id}>
                      {bank.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {paymentMethod && (
            <button className="pay-button" onClick={handlePayment} disabled={processing}>
              {processing ? "Processing..." : `Pay Securely (₹${totalAmount.toFixed(2)})`}
            </button>
          )}

          <div className="trust-support">
            <p className="powered-by">
              Powered by <strong><i>UPay</i></strong>
            </p>
            <p className="secure-checkout">
              Your payment details are encrypted and secure.
            </p>
            <p className="need-help">
              Need Help? <Link to="/help">Contact Support</Link>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

Payment.propTypes = {
  cart: PropTypes.array.isRequired,
};

export default Payment;
