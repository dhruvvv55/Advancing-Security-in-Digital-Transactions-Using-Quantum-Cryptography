// Success.jsx
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import "../styles/style.css";

const Success = ({ setCart }) => {
  const location = useLocation();
  // Retrieve orderDetails from the location state; fallback to localStorage.
  const passedOrderDetails = location.state?.orderDetails;
  const storedOrderDetails = JSON.parse(localStorage.getItem("orderDetails"));
  const orderDetails = passedOrderDetails || storedOrderDetails || {
    transactionId: "ABCDEF123456",
    deliveryDate: null,
    items: [],
  };

  // Destructure the properties we're using.
  const { transactionId, deliveryDate, items } = orderDetails;

  useEffect(() => {
    setCart([]);
  }, [setCart]);

  // Calculate expected delivery date if not provided.
  let expectedDeliveryDate = deliveryDate;
  if (!expectedDeliveryDate) {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    expectedDeliveryDate = date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="container">
      <div className="success-card">
        <div className="icon">
          {/* SVG Success Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            fill="#4BB543"
            viewBox="0 0 24 24"
          >
            <path d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zM10 17l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <h1>Payment Successful</h1>
        <p>Your transaction has been processed successfully.</p>
        <div className="transaction-details">
          <p>
            Transaction ID: <strong>{transactionId}</strong>
          </p>
          <p>
            Your order will be delivered on{" "}
            <strong>{expectedDeliveryDate}</strong>.
          </p>
        </div>
        {items && items.length > 0 && (
          <div className="order-items">
            <h3>Your Order:</h3>
            <ul>
              {items.map((item, index) => (
                <li key={index}>
                  {item.name} - Qty: {item.quantity || 1} - Price: ₹{item.price}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Link to="/" className="button">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

Success.propTypes = {
  setCart: PropTypes.func.isRequired,
};

export default Success;
