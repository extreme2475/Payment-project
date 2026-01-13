import React, { useState, useEffect } from "react";
import api from "../api";
import ContactList from "../components/Chat/ContactList";
import ChatWindow from "../components/Chat/ChatWindow";
import { io } from "socket.io-client";

const ChatPage = ({ currentUser }) => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadMap, setUnreadMap] = useState({});
  const [socket, setSocket] = useState(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);
    if (currentUser?._id) {
      newSocket.emit("register_user", currentUser._id);
    }
    return () => newSocket.close();
  }, [currentUser]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (selectedContact && newMessage.sender === selectedContact._id) {
        setMessages((prev) => [...prev, newMessage]);
        socket.emit("mark_as_read", {
          senderId: newMessage.sender,
          receiverId: currentUser._id
        });
      } else {
        setUnreadMap((prev) => ({ ...prev, [newMessage.sender]: true }));
      }
    };

    const handleDeleteMessage = ({ msgId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
    };

    const handleStatusUpdate = ({ status }) => {
      setMessages((prev) => prev.map(m => ({ ...m, status: status })));
    };

    socket.on("receive_message", handleNewMessage);
    socket.on("message_deleted", handleDeleteMessage);
    socket.on("status_updated", handleStatusUpdate);

    return () => {
      socket.off("receive_message", handleNewMessage);
      socket.off("message_deleted", handleDeleteMessage);
      socket.off("status_updated", handleStatusUpdate);
    };
  }, [socket, selectedContact, currentUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users/all");
        setContacts(res.data.users);
      } catch (err) {
        console.error("Error fetching contacts:", err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      if (!selectedContact) return;
      try {
        const res = await api.get(`/chat/history/${selectedContact._id}`);
        setMessages(res.data.chatHistory);
        
        setUnreadMap((prev) => {
          const copy = { ...prev };
          delete copy[selectedContact._id];
          return copy;
        });
        setShowChat(true);
      } catch (err) {
        console.error("Error loading chat history:", err);
      }
    };
    loadHistory();
  }, [selectedContact]);

  if (!currentUser || !currentUser._id) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs mt-4">Syncing Profile...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F8FAFC] flex items-center justify-center p-0 md:p-8 lg:p-12">
      <div className="flex h-full w-full max-w-7xl bg-white shadow-2xl md:rounded-[3rem] overflow-hidden border border-slate-100">
        
        {/* Contact List */}
        <div className={`${showChat ? 'hidden' : 'flex'} md:flex w-full md:w-80 lg:w-96 border-r border-slate-100`}>
          <ContactList
            contacts={contacts}
            onSelect={setSelectedContact}
            selectedId={selectedContact?._id}
            unreadMap={unreadMap}
          />
        </div>

        {/* Chat Window */}
        <div className={`${!showChat ? 'hidden' : 'flex'} md:flex flex-1`}>
          {selectedContact ? (
            <ChatWindow
              currentUser={currentUser}
              selectedContact={selectedContact}
              messages={messages}
              setMessages={setMessages}
              socket={socket}
              setUnreadMap={setUnreadMap}
              onBack={() => setShowChat(false)} 
            />
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50 text-slate-400">
              Select a contact to start chatting
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ChatPage;