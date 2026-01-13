import React, { useState, useEffect, useRef } from "react";
import api from "../../api";
import { FaPaperPlane, FaLock, FaCircle, FaTrash, FaCheckDouble, FaTrashAlt, FaArrowLeft } from "react-icons/fa";

const ChatWindow = ({ currentUser, selectedContact, messages, setMessages, setUnreadMap, socket, onBack }) => {
  const [text, setText] = useState("");
  const scrollRef = useRef();

  // FIX: Mark as read logic
  useEffect(() => {
    if (selectedContact && currentUser && socket) {
      api.put(`/chat/read/${selectedContact._id}`);
      socket.emit("mark_as_read", {
        senderId: selectedContact._id,
        receiverId: currentUser._id
      });
    }
  }, [selectedContact, currentUser, socket]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedContact) return;

    const messageData = {
      sender: currentUser._id,
      receiver: selectedContact._id,
      text,
      status: "sent",
      createdAt: new Date().toISOString()
    };

    socket.emit("send_message", messageData);
    setMessages((prev) => [...prev, messageData]);
    setText("");
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear all messages?")) {
      setMessages([]);
    }
  };

  // FIX: Delete for everyone logic
  const deleteMessage = (msgId, index) => {
    if (window.confirm("Delete this message for everyone?")) {
      setMessages((prev) => prev.filter((m, i) => msgId ? m._id !== msgId : i !== index));
      if (socket && selectedContact) {
        socket.emit("delete_message", {
          msgId: msgId,
          receiverId: selectedContact._id
        });
      }
    }
  };

  if (!selectedContact) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 border border-slate-50">
          <FaLock className="text-3xl text-indigo-200" />
        </div>
        <h3 className="text-slate-900 font-black text-xl tracking-tight">End-to-End Encrypted</h3>
        <p className="text-slate-400 font-medium mt-1">Select a contact to begin a secure conversation.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* HEADER SECTION */}
      <div className="px-4 md:px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3 md:gap-4">
          
          {/* BACK ARROW - Visible only on mobile */}
          <button 
            onClick={onBack} 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <FaArrowLeft className="text-lg" />
          </button>

          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-100 uppercase text-sm md:text-base">
            {selectedContact.username[0]}
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base md:text-lg leading-none tracking-tight">
              {selectedContact.username}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 md:mt-2">
              <FaCircle className="text-[8px] text-emerald-500 animate-pulse" />
              <span className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest">
                Secure Connection
              </span>
            </div>
          </div>
        </div>
        
        <button onClick={clearChat} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
          <FaTrashAlt />
        </button>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6 bg-[#F8FAFC]">
        {messages.map((msg, i) => {
          const isMe = msg.sender === currentUser._id;
          return (
            <div key={msg._id || i} className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-3 group`}>
              {!isMe && <div className="w-2 h-2 rounded-full bg-slate-200 mb-4" />}
              <div className={`max-w-[85%] md:max-w-[70%] px-5 py-3 md:px-6 md:py-4 shadow-sm relative ${isMe ? "bg-slate-900 text-white rounded-[1.5rem] md:rounded-[2rem] rounded-br-none" : "bg-white text-slate-700 border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] rounded-bl-none"}`}>
                <button 
                  onClick={() => deleteMessage(msg._id, i)}
                  className={`absolute -top-2 ${isMe ? "-left-8" : "-right-8"} p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  <FaTrash className="text-xs" />
                </button>
                <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                <div className={`flex items-center gap-2 mt-2 opacity-40 ${isMe ? "justify-end" : "justify-start"}`}>
                  <span className="text-[9px] font-black uppercase">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && (
                    <FaCheckDouble className={`text-[10px] ${msg.status === 'read' ? "text-indigo-400" : "text-slate-400"}`} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-4 md:p-6 bg-white border-t border-slate-50">
        <form onSubmit={handleSend} className="flex items-center gap-3 bg-slate-50 p-2 rounded-[2rem] border border-slate-100 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-200 transition-all duration-300">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 bg-transparent border-none px-4 md:px-5 py-2 md:py-3 text-sm focus:ring-0 outline-none text-slate-700 font-medium"
            placeholder="Type your message..."
          />
          <button type="submit" className="bg-indigo-600 text-white p-3 md:p-4 rounded-full hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">
            <FaPaperPlane className="text-sm" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;