import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { api } from '../App';
import { Search } from 'lucide-react';

// Check if app is hosted on Vercel and adjust socket transport
const isProductionOnVercel = window.location.origin.includes('vercel.app');
const transportsOption = isProductionOnVercel ? ['polling'] : ['websocket', 'polling'];

let socket;
try {
  const socketUrl = process.env.NODE_ENV === 'production'
  ? 'https://legacy-api-rbyi.onrender.com'
  : 'http://localhost:5000';;
  socket = io(socketUrl, {
    withCredentials: true,
    transports: transportsOption,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    autoConnect: true
  });
} catch (error) {
  console.error("Socket connection error:", error);
  socket = { on: () => {}, off: () => {}, emit: () => {}, connect: () => {} };
}

function CommunityChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);
  const { isLoggedIn, user = {} } = useAuth();
  
  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch previous messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await api.get('/api/messages', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, []);

  // Handle socket connection and events
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    socket.on('chat message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('chat message');
    };
  }, []);

  // Send message function
  const handleSendMessage = () => {
    if (newMessage.trim() && isLoggedIn) {
      const messageData = {
        text: newMessage,
        sender: user?.name || 'Anonymous',
        timestamp: new Date().toISOString(),
      };
      socket.emit('sendMessage', messageData);
      setNewMessage('');
    }
  };

  // Handle enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  // Format message date
  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Unknown Date';

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  };

  // Filter messages based on search
  const filteredMessages = searchTerm
    ? messages.filter(msg =>
        msg.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.sender.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : messages;

  return (
    <div className="pt-24 w-screen px-3">
      <section className="py-20 bg-emerald-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-800 mb-6">Community Chat</h1>
            <div className="bg-white rounded-lg shadow-lg p-6 relative">

              {!isLoggedIn && (
                <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center rounded-lg z-10">
                  <div className="text-center p-6">
                    <p className="text-gray-600 mb-6">
                      Please sign in to join the community chat and connect with others.
                    </p>
                    <Link to="/signin" className="bg-emerald-600 text-white px-6 py-3 rounded-full hover:bg-emerald-700">
                      Sign In
                    </Link>
                  </div>
                </div>
              )}

              {/* Search Bar */}
              <div className="mb-4 relative">
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  disabled={!isLoggedIn || messages.length === 0}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2 text-gray-400 hover:text-gray-600">
                    ✕
                  </button>
                )}
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto mb-4 text-left px-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                  </div>
                ) : (
                  filteredMessages.map((msg, index) => (
                    <React.Fragment key={index}>
                      {index === 0 || formatMessageDate(msg.timestamp) !== formatMessageDate(filteredMessages[index - 1].timestamp) ? (
                        <div className="flex items-center my-4">
                          <span className="mx-4 text-sm text-gray-500">{formatMessageDate(msg.timestamp)}</span>
                          <div className="flex-1 border-t border-gray-300"></div>
                        </div>
                      ) : null}
                      <div className={`mb-4 ${msg.sender === user?.name ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block rounded-lg py-2 px-4 ${msg.sender === user?.name ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                          <div className="font-bold text-sm">{msg.sender}</div>
                          <div>{msg.text}</div>
                          <div className="text-xs opacity-70 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </React.Fragment>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Type your message..."
                  disabled={!isLoggedIn}
                />
                <button onClick={handleSendMessage} className="ml-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                  Send
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CommunityChat;
