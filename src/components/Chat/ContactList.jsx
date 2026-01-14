import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

const ContactList = ({ contacts, onSelect, selectedId, unreadMap }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContacts = contacts.filter((c) =>
    c.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full md:w-[400px] border-r border-slate-50 flex flex-col bg-white h-full">
      <div className="p-6 md:p-8 pb-4">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter mb-6">Messages</h2>
        <div className="relative group">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none font-medium placeholder:text-slate-400"
            placeholder="Search network..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 md:px-4 py-4 space-y-2">
        {filteredContacts.map((user) => {
          const isActive = selectedId === user._id;
          return (
            <div
              key={user._id}
              onClick={() => onSelect(user)}
              className={`flex items-center p-3 md:p-5 rounded-[1.5rem] md:rounded-[2.5rem] cursor-pointer transition-all duration-300 relative group ${
                isActive ? "bg-slate-900 text-white shadow-xl" : "hover:bg-indigo-50/50 text-slate-600"
              }`}
            >
              {/* Avatar Wrapper */}
              <div className="relative shrink-0">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-black text-lg md:text-xl shrink-0 transition-transform duration-500 ${
                  isActive ? "bg-white/10 text-white scale-90" : "bg-indigo-50 text-indigo-600"
                }`}>
                  {user.username[0].toUpperCase()}
                </div>

                {/* Fixed Red Dot for Mobile & Desktop */}
                {unreadMap?.[user._id] && !isActive && (
                  <span className="absolute -top-1 -right-1 z-20 w-4 h-4 bg-rose-500 border-2 border-white rounded-full animate-pulse shadow-md"></span>
                )}
              </div>

              <div className="ml-4 md:ml-5 flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-black text-sm tracking-tight truncate ${isActive ? "text-white" : "text-slate-900"}`}>
                    {user.username}
                  </span>
                </div>
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40 truncate">
                  {user.phone}
                </p>
              </div>

              {isActive && (
                <div className="absolute right-3 md:right-4 w-1.5 h-6 md:h-8 bg-indigo-500 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContactList;