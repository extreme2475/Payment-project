// src/pages/login.jsx
import React from "react";
// Assuming the file is named "Navbar.jsx"
import Navbar from "../components/Navabar/Navbar.jsx";

const Intro = () => {
  return (
    <div>
      <Navbar />
      <div className="pt-16 p-4">
        <h1 className="text-2xl font-bold">Hello Mini GPay!</h1>
        <p className="mt-2 text-gray-600">
          This is a test page to check Navbar responsiveness.
        </p>
        <div className="mt-8 h-[1000px] bg-gray-100 rounded-lg p-4">
          Scrollable content here to test fixed navbar
        </div>
      </div>
    </div>
  );
};

export default Intro;