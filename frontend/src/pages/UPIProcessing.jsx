import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/style.css";

const UPIProcessing = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      navigate("/success");
    }, 6500); // ✅ Increased to 7 seconds
  }, [navigate]);

  return (
    <div className="upi-processing-container">
      <h1>Processing UPI Payment...</h1>
      <p>Request sent to <strong>{state?.upiId}</strong></p>
      {loading && <div className="loader"></div>}
      {!loading && <p className="payment-animation">Payment Successful ✅</p>}
    </div>
  );
};

export default UPIProcessing;
