
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: { full_name: string };
  receiver?: { full_name: string };
  product?: { name: string };
  product_id?: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: string;
  receiverName: string;
  productId?: string;
  productName?: string;
}

export default function ChatModal({ isOpen, onClose, receiverId, receiverName, productId, productName }: ChatModalProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && receiverId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000); // Poll for new messages
      return () => clearInterval(interval);
    }
  }, [isOpen, receiverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?userId=${receiverId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) {
      console.log('🚫 Cannot send: empty message or no user');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Sending message to:', receiverId);
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId,
          content: newMessage,
          productId: productId || messages.find(m => m.product_id)?.product_id
        })
      });

      if (response.ok) {
        console.log('✅ Message sent successfully');
        setNewMessage('');
        fetchMessages();
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to send message:', errorData);
        alert(`Failed to send: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      alert('Network error while sending message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col h-[600px] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-linear-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold border border-white/30">
              {receiverName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold">{receiverName}</h3>
              {productName && (
                <p className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  Inquiry: {productName}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center px-8">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl mb-4 shadow-sm">💬</div>
              <p className="font-medium text-gray-700">No messages yet</p>
              <p className="text-sm mt-1">Start a conversation with {receiverName} {productName ? `about ${productName}` : ''}.</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const showName = index === 0 || messages[index-1].sender_id !== msg.sender_id;
              const isMe = msg.sender_id === user?.id;
              
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {showName && (
                    <span className="text-[10px] font-semibold text-gray-400 mb-1 px-1">
                      {isMe ? 'You' : msg.sender?.full_name || receiverName}
                    </span>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                    isMe 
                      ? 'bg-green-600 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}>
                    {msg.product && index === 0 && (
                      <p className={`text-[10px] font-bold mb-1 pb-1 border-b ${isMe ? 'border-green-500/50' : 'border-gray-100'}`}>
                        Ref: {msg.product.name}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className={`text-[10px] mt-1.5 flex justify-end items-center gap-1 ${isMe ? 'text-green-100' : 'text-gray-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isMe && msg.is_read && <span>• Read</span>}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-linear-to-r from-green-600 to-emerald-600 text-white p-3 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center w-12 h-12"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
