import { Link } from "react-router-dom";
import "../styles/style.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-link"><h1>ShopFusion</h1></Link>
      <div>
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/cart" className="nav-link">Cart</Link>
      </div>
    </nav>
  );
};

export default Navbar;
