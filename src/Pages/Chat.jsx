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
      // Agar wahi contact select hai jisne message bheja, toh message list update karo
      if (selectedContact && newMessage.sender === selectedContact._id) {
        setMessages((prev) => [...prev, newMessage]);
        // Saath hi backend ko batao ki message read ho gaya (Blue tick trigger)
        socket.emit("mark_as_read", {
          senderId: newMessage.sender,
          receiverId: currentUser._id
        });
      } else {
        // Agar koi aur chat khuli hai, toh red dot (unread) dikhao
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
      <div className="flex h-full w-full max-w-7xl bg-white shadow-[0_32px_80px_-16px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden border border-slate-100">
        <ContactList
          contacts={contacts}
          onSelect={setSelectedContact}
          selectedId={selectedContact?._id}
          unreadMap={unreadMap}
        />
        <ChatWindow
          currentUser={currentUser}
          selectedContact={selectedContact}
          messages={messages}
          setMessages={setMessages}
          socket={socket}
          setUnreadMap={setUnreadMap}
        />
      </div>
    </div>
  );
};

export default ChatPage;