import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/style.css";

const TransactionStatus = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { state } = useLocation();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      navigate("/success");
    }, 3000);
  }, [navigate]);

  return (
    <div className="transaction-status">
      <h1>{state?.paymentMethod === "upi" ? "Processing UPI Payment..." : "Processing Transaction..."}</h1>
      {loading && <div className="loader"></div>}
      {!loading && <h2>Payment Successful ✅</h2>}
    </div>
  );
};

export default TransactionStatus;
