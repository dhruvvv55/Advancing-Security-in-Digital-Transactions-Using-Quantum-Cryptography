// UpiQrCode.jsx

// 1. Import PropTypes
import PropTypes from "prop-types";
import { QRCodeCanvas } from "qrcode.react";

// 2. Define your component (notice no import React if using React 17+)
const UpiQrCode = ({ upiID, amount }) => {
  const payeeName = "Demo Merchant";
  const transactionNote = "Demo Payment";
  const amountFormatted = parseFloat(amount).toFixed(2);
  const upiUrl = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(
    payeeName
  )}&tn=${encodeURIComponent(transactionNote)}&am=${amountFormatted}&cu=INR`;

  return (
    <div style={{ textAlign: "center" }}>
      <h3>Scan this QR code with GPay or any UPI app</h3>
      <QRCodeCanvas value={upiUrl} size={200} />
      <p style={{ marginTop: "10px", fontSize: "0.9em", color: "#666" }}>
        {upiUrl}
      </p>
    </div>
  );
};

// 3. Add propTypes
UpiQrCode.propTypes = {
  upiID: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
};

export default UpiQrCode;
