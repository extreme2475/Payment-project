import React, { useState } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom"; 
import yo from "../../assets/yo.webp";
import { FaBars, FaTimes, FaSignOutAlt, FaChevronRight } from "react-icons/fa"; 

const Navbar = ({
  logoText = { bold: "NEXA", light: "PAY" },
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Menu items for Mobile Dropdown (Matches Sidebar)
  const menuSections = [
    { label: "Main", items: [{ name: "Dashboard", path: "/dashboard" }, { name: "Analytics", path: "/analytics" }, { name: "Wallet", path: "/wallet" }] },
    { label: "Services", items: [{ name: "Payments", path: "/payments" }, { name: "Loans", path: "/loans" }, { name: "Loans Dash", path: "/loansdash" }, { name: "Credit Score", path: "/credit" }, { name: "Schedule", path: "/time" }] },
    { label: "Connect", items: [{ name: "Chat", path: "/chat" }, { name: "Help", path: "/help" }] }
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token"); 
      navigate("/show");
      window.location.reload(); 
    }
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 fixed w-full z-[150] top-0 h-20 flex items-center">
      <div className="w-full px-6 lg:px-12 flex justify-between items-center">

        {/* Left: Logo (Clean Navbar on Desktop) */}
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

        {/* Mobile Buttons: Only visible on small screens */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={handleLogout}
            className="p-3 bg-slate-900 text-white rounded-xl shadow-lg active:scale-95 transition-transform"
          >
            <FaSignOutAlt size={18} />
          </button>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="p-3 rounded-xl bg-indigo-600 text-white shadow-lg active:scale-95 transition-transform"
          >
            {mobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown: Everything shifts here on mobile */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b shadow-2xl p-6 md:hidden max-h-[85vh] overflow-y-auto">
          <div className="space-y-8">
            {menuSections.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                  {section.label}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-5 py-4 rounded-2xl font-bold text-sm transition-all ${
                          isActive 
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                            : "bg-gray-50 text-gray-600"
                        }`
                      }
                    >
                      {item.name}
                      <FaChevronRight size={10} className="opacity-50" />
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;