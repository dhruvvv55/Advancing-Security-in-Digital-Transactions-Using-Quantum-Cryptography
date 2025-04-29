import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/style.css";

const Checkout = () => {
  const [cardNumber, setCardNumber] = useState("");
  const navigate = useNavigate();

  const handlePayment = () => {
    navigate("/payment", { state: { cardNumber } });
  };

  return (
    <div className="container">
      <h1>Checkout</h1>
      <input
        type="text"
        placeholder="Enter Card Number"
        className="input-field"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
      />
      <button onClick={handlePayment} className="button">Proceed to Payment</button>
    </div>
  );
};

export default Checkout;
