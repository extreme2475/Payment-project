import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome, FaWallet, FaChartLine, FaCommentDots, FaHandHoldingUsd,
  FaTable, FaShieldAlt, FaCalendarAlt, FaMoneyBill, FaQuestionCircle, 
  FaAngleLeft, FaAngleRight, FaSignOutAlt
} from "react-icons/fa";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setCollapsed]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      navigate("/show");
      window.location.reload();
    }
  };

  const menuSections = [
    {
      label: "Main",
      items: [
        { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
        { name: "Analytics", icon: <FaChartLine />, path: "/analytics" },
        { name: "Wallet", icon: <FaWallet />, path: "/wallet" },
      ]
    },
    {
      label: "Services",
      items: [
        { name: "Payments", icon: <FaMoneyBill />, path: "/payments" },
        { name: "Loans", icon: <FaHandHoldingUsd />, path: "/loans" },
        { name: "Loans Dash", icon: <FaTable />, path: "/loansdash" },
        { name: "Credit Score", icon: <FaShieldAlt />, path: "/credit" },
        { name: "Schedule", icon: <FaCalendarAlt />, path: "/time" },
      ]
    },
    {
      label: "Connect",
      items: [
        { name: "Chat", icon: <FaCommentDots />, path: "/chat" },
        { name: "Help", icon: <FaQuestionCircle />, path: "/help" },
      ]
    }
  ];

  return (
    <aside
      className={`bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] min-h-screen flex flex-col transition-all duration-500 ease-in-out border-r border-gray-100
        ${collapsed ? "w-24" : "w-72"} 
        hidden md:flex fixed top-0 left-0 h-screen z-[140]`}
    >
      <div className="flex items-center justify-between h-20 px-6 shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-3 animate-in fade-in zoom-in duration-500">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-white font-black text-xl">N</span>
            </div>
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
              NEXA PAY
            </span>
          </div>
        ) : (
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 mx-auto transition-all">
            <span className="text-white font-black text-xl">N</span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto no-scrollbar">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            {!collapsed && (
              <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                {section.label}
              </p>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                    isActive 
                      ? "bg-indigo-50 text-indigo-600 shadow-sm active-nav" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
                  }`
                }
              >
                <span className={`text-xl shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                  {item.icon}
                </span>
                {!collapsed && <span className="ml-4 font-bold text-sm whitespace-nowrap tracking-tight">{item.name}</span>}
                <div className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full scale-y-0 group-[.active-nav]:scale-y-100 transition-transform duration-300" />
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Logout & Collapse Section at bottom */}
      <div className="p-4 border-t border-gray-50 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm group"
        >
          <FaSignOutAlt className="text-xl shrink-0 group-hover:scale-110 transition-transform" />
          {!collapsed && <span className="ml-4">Logout</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-3 rounded-2xl bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
        >
          {collapsed ? (
            <FaAngleRight className="text-xl group-hover:translate-x-1 transition-transform" />
          ) : (
            <div className="flex items-center gap-3 font-bold text-sm">
              <FaAngleLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
              <span>Collapse Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;