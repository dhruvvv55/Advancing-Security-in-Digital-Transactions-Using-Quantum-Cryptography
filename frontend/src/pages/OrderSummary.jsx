import PropTypes from "prop-types"; // ✅ Import PropTypes
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/style.css";

const OrderSummary = ({ cart, setCart }) => { // ✅ Receive cart and setCart as props
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(cart.reduce((acc, item) => acc + item.price, 0)); // ✅ Dynamically update total
  }, [cart]);

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id)); // ✅ Remove item from cart
  };

  return (
    <div className="container">
      <h1>Order Summary</h1>
      {cart.length === 0 ? (
        <p>No items in cart. <Link to="/">Add items from Store</Link></p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <h2>{item.name}</h2>
              <p>₹{item.price}</p>
              <button onClick={() => removeFromCart(item.id)} className="button">Remove</button>
            </div>
          ))}
          <h2>Total Amount: ₹{total}</h2>
          <Link to="/payment" className="button">Proceed to Payment</Link>
        </>
      )}
    </div>
  );
};

// ✅ Add PropTypes Validation
OrderSummary.propTypes = {
  cart: PropTypes.array.isRequired,
  setCart: PropTypes.func.isRequired, // ✅ Ensure setCart is required
};

export default OrderSummary;
