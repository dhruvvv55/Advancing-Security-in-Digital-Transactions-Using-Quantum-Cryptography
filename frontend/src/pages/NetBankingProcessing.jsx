import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/style.css";

const NetBankingProcessing = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      navigate("/success");
    }, 6500); //
  }, [navigate]);

  return (
    <div className="container">
      <h1>Processing Net Banking Transaction...</h1>
      <p>Transaction initiated via <strong>{state?.selectedBank}</strong></p>
      {loading && <div className="loader"></div>}
      {!loading && <h2>Payment Successful ✅</h2>}
    </div>
  );
};

export default NetBankingProcessing;
