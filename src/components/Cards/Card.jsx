// src/components/Cards/Card.jsx
import React from "react";

const Card = ({ title, value, children, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="border-2 border-blue-500 rounded-lg p-4 cursor-pointer hover:bg-blue-50 transition duration-200"
      style={{ minWidth: "200px" }}
    >
      {/* Card Title */}
      <h3 className="text-lg font-semibold text-blue-700">{title}</h3>

      {/* Value (optional) */}
      {value && <p className="text-2xl mt-2 text-blue-900">{value}</p>}

      {/* Any children inside the card */}
      {children}
    </div>
  );
};

export default Card;
