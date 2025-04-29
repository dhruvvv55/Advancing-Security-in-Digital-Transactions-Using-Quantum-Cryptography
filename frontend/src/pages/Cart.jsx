import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "../styles/style.css";

const Cart = ({ cart, setCart }) => {
  // Increment
  const incrementQuantity = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Decrement or remove
  const decrementQuantity = (id) => {
    setCart(
      cart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Calculate total
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container">
      <h1>Shopping Cart</h1>
      {cart.length === 0 ? (
        <p>
          Your cart is empty. <Link to="/">Add items from Store</Link>
        </p>
      ) : (
        <>
          {/* Render each cart item */}
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-left">
                <img src={item.image} alt={item.name} className="product-image" />
                <div className="cart-item-details">
                  <h2>{item.name}</h2>
                  <p>₹{item.price}</p>
                </div>
              </div>
              <div className="cart-item-right">
                <button onClick={() => decrementQuantity(item.id)} className="button">–</button>
                <span>{item.quantity}</span>
                <button onClick={() => incrementQuantity(item.id)} className="button">+</button>
              </div>
            </div>
          ))}

          {/* Footer with total and proceed button */}
          <div className="cart-footer">
            <div className="cart-total">Total: ₹{totalAmount}</div>
            <Link to="/payment" className="button proceed-button">
              Proceed to Order Summary
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

Cart.propTypes = {
  cart: PropTypes.array.isRequired,
  setCart: PropTypes.func.isRequired,
};

export default Cart;
