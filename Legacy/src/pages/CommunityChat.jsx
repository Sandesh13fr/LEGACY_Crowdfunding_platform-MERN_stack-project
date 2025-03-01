import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from "../axiosConfig"; 
import { Search } from 'lucide-react';

// Connect to the socket server
const socket = io('http://localhost:5000');

function CommunityChat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, isLoggedIn } = useAuth();
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchPreviousMessages = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/messages', {
        headers: {
          withCredentials: true,
          'Authorization': `Bearer ${token}`
        }
      });
      setMessages(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching previous messages:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreviousMessages();
  }, []);

  useEffect(() => {
    // Connection status events
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
      scrollToBottom();
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('chat message');
    };
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (!searchTerm) {
      scrollToBottom();
    }
  }, [messages, searchTerm]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const messageData = {
        text: message,
        sender: user?.name || 'Anonymous',
        timestamp: new Date().toISOString(),
      };
      socket.emit('sendMessage', messageData);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
  
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Filter messages based on search term
  const filteredMessages = searchTerm
    ? messages.filter(msg => 
        msg.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.sender.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : messages;

  // Reset search
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="pt-24 w-screen px-3">
      <section className="py-20 bg-emerald-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-800 mb-6">Community Chat</h1>
            <div className="bg-white rounded-lg shadow-lg p-6 relative">
              {!isLoggedIn ? (
                <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center rounded-lg z-10">
                  <div className="text-center p-6">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Required</h2>
                    <p className="text-gray-600 mb-6">
                      Please sign in to join the community chat and connect with other members.
                    </p>
                    <Link 
                      to="/signin" 
                      className="bg-emerald-600 text-white px-6 py-3 rounded-full hover:bg-emerald-700 transition-colors inline-block"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              ) : null}
              
              {/* Search functionality */}
              <div className="mb-4 relative">
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={!isLoggedIn || messages.length === 0}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Search results indicator */}
              {searchTerm && (
                <div className="mb-2 text-left text-sm text-gray-500">
                  Found {filteredMessages.length} {filteredMessages.length === 1 ? 'message' : 'messages'} matching "{searchTerm}"
                  {filteredMessages.length > 0 && (
                    <button
                      onClick={clearSearch}
                      className="ml-2 text-emerald-600 hover:text-emerald-700"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
              
              <div className="h-96 overflow-y-auto mb-4 text-left px-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                  </div>
                ) : (
                  <>
                    {filteredMessages.length === 0 ? (
                      <div className="flex justify-center items-center h-full">
                        <p className="text-gray-500">
                          {searchTerm 
                            ? "No messages match your search." 
                            : "No messages yet. Be the first to say hello!"}
                        </p>
                      </div>
                    ) : (
                      (() => {
                        let currentDate = null;
                        return filteredMessages.map((msg, index) => {
                          const messageDate = formatMessageDate(msg.timestamp);
                          const showDateDivider = messageDate !== currentDate;
                          currentDate = messageDate;
                          
                          return (
                            <React.Fragment key={index}>
                              {showDateDivider && (
                                <div className="flex items-center my-4">
                                  <div className="flex-1 border-t border-gray-300"></div>
                                  <span className="mx-4 text-sm text-gray-500">{messageDate}</span>
                                  <div className="flex-1 border-t border-gray-300"></div>
                                </div>
                              )}
                              <div className={`mb-4 ${msg.sender === user?.name ? 'text-right' : 'text-left'}`}>
                                <div className={`inline-block rounded-lg py-2 px-4 ${
                                  msg.sender === user?.name ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-800'
                                }`}>
                                  <div className="font-bold text-sm">{msg.sender}</div>
                                  <div>
                                    {searchTerm ? (
                                      <HighlightText text={msg.text} searchTerm={searchTerm} />
                                    ) : (
                                      msg.text
                                    )}
                                  </div>
                                  <div className="text-xs opacity-70 mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                  </div>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        });
                      })()
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-2 border rounded-l-lg focus:outline-none"
                  placeholder="Type your message..."
                  disabled={!isLoggedIn}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!isConnected || !isLoggedIn}
                  className={`px-4 py-2 rounded-r-lg transition-colors ${
                    isConnected && isLoggedIn
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                      : 'bg-gray-400 text-gray-200'
                  }`}
                >
                  Send
                </button>
              </div>
              {!isConnected && isLoggedIn && (
                <div className="mt-2 text-red-500 text-sm">
                  Disconnected from chat server. Trying to reconnect...
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper component to highlight search term in text
function HighlightText({ text, searchTerm }) {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? <mark key={i} className="bg-yellow-200 text-gray-800">{part}</mark> : part
      )}
    </>
  );
}

export default CommunityChat;