import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import yo from "../../assets/yo.webp";
import { FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa"; 

const Navbar = ({
  links = [],           
  icons = [],           
  gap = "gap-8",    
  logoText = { bold: "NEXA", light: "PAY" },
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token"); 
      navigate("/");
      window.location.reload(); 
    }
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 fixed w-full z-[150] top-0 h-20 flex items-center">
      <div className="w-full px-6 lg:px-12">
        <div className="flex justify-between items-center h-full">

          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-1 bg-white rounded-xl shadow-sm border border-gray-50">
                <img src={yo} alt="Logo" className="h-9 w-auto object-contain" />
              </div>
              <span className="text-2xl tracking-tighter">
                <span className="font-black text-slate-900">{logoText.bold}</span>
                <span className="font-light text-indigo-600 ml-0.5">{logoText.light}</span>
              </span>
            </Link>
          </div>

          {/* Right Section: FIXED STABILITY */}
          <div className="flex items-center flex-shrink-0 ml-auto gap-4">
            
            {/* Desktop Navigation */}
            <div className={`hidden md:flex ${gap} items-center mr-6`}>
              {links.map((link, index) => (
                <a key={index} href={link.url} className="text-xs font-black text-slate-500 hover:text-indigo-600 uppercase tracking-widest whitespace-nowrap">
                  {link.name}
                </a>
              ))}
            </div>

            {/* Icons */}
            <div className="hidden sm:flex items-center space-x-2">
              {icons.map((IconComp, index) => (
                <button key={index} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600">{IconComp}</button>
              ))}
            </div>

            {/* --- THE LOGOUT BUTTON (Absolute Priority) --- */}
            <button
              onClick={handleLogout}
              className="group relative flex items-center justify-center w-11 h-11 bg-slate-900 text-white rounded-xl overflow-hidden shadow-lg flex-shrink-0 hover:w-32 transition-all duration-300"
            >
              <div className="flex items-center justify-center w-full transition-all group-hover:translate-x-[-15%]">
                <FaSignOutAlt className="text-lg" />
              </div>
              <div className="absolute right-4 opacity-0 group-hover:opacity-100 text-[10px] font-black uppercase transition-all translate-x-12 group-hover:translate-x-0 whitespace-nowrap">
                Logout
              </div>
            </button>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2.5 rounded-xl bg-slate-50 text-slate-900 border">
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b shadow-2xl p-6 md:hidden">
          <div className="space-y-3">
            {links.map((link, index) => (
              <a key={index} href={link.url} className="block px-4 py-3 rounded-2xl text-slate-700 font-black uppercase text-sm">{link.name}</a>
            ))}
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 text-red-600 font-black uppercase text-sm">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;