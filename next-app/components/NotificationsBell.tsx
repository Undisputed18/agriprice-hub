'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import ChatModal from '@/components/ChatModal';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: { full_name: string };
  product?: { id: string, name: string };
}

export default function NotificationsBell() {
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState<Message[]>([]);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChat, setActiveChat] = useState({ id: '', name: '', productId: '', productName: '' });

  useEffect(() => {
    if (user && user.role === 'farmer') {
      fetchUnreadMessages();
      const interval = setInterval(fetchUnreadMessages, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        const unread = (data.messages || []).filter((m: any) => 
          m.receiver_id === user?.id && !m.is_read
        );
        setUnreadMessages(unread);
      }
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  const handleOpenConversation = async (msg: Message) => {
    setActiveChat({
      id: msg.sender_id,
      name: msg.sender?.full_name || 'Agro-Dealer',
      productId: msg.product?.id || '',
      productName: msg.product?.name || ''
    });
    
    setIsInboxOpen(false);
    setIsChatOpen(true);
    
    try {
      await fetch(`/api/messages/${msg.id}/read`, { method: 'POST' });
      setUnreadMessages(prev => prev.filter(m => m.id !== msg.id));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent, msgId: string) => {
    e.stopPropagation();
    try {
      setUnreadMessages(prev => prev.filter(m => m.id !== msgId));
      await fetch(`/api/messages/${msgId}/read`, { method: 'POST' });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  if (!user || user.role !== 'farmer') return null;

  return (
    <>
      <div className="relative">
        <button 
          onClick={() => setIsInboxOpen(!isInboxOpen)}
          className="p-2 text-green-100 hover:text-white hover:bg-green-600 rounded-full transition-all relative"
          title="Messages from Agro-Dealers"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadMessages.length > 0 && (
            <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-green-700 animate-pulse">
              {unreadMessages.length}
            </span>
          )}
        </button>

        {isInboxOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="bg-green-600 px-4 py-3 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Dealer Messages</h3>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                {unreadMessages.length} New
              </span>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {unreadMessages.length === 0 ? (
                <div className="py-10 text-center text-gray-400">
                  <div className="text-3xl mb-2">📭</div>
                  <p className="text-xs font-medium">No new messages from dealers</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {unreadMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      onClick={() => handleOpenConversation(msg)}
                      className="p-4 hover:bg-green-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">
                          {msg.sender?.full_name || 'Agro-Dealer'}
                        </span>
                        <span className="text-[9px] text-gray-400">{new Date(msg.created_at).toLocaleDateString()}</span>
                      </div>
                      {msg.product && (
                        <p className="text-[10px] font-semibold text-emerald-600 mb-1 italic">
                          Re: {msg.product.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-800 line-clamp-2 leading-relaxed">{msg.content}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-[10px] text-green-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          Reply Now <span>→</span>
                        </span>
                        <button 
                          onClick={(e) => handleMarkAsRead(e, msg.id)}
                          className="text-[9px] text-gray-400 hover:text-green-600 font-medium flex items-center gap-1 bg-gray-50 group-hover:bg-white px-2 py-1 rounded-md border border-transparent hover:border-green-100 transition-all"
                        >
                          ✓ Mark Read
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-2 bg-gray-50 border-t border-gray-100">
              <button 
                onClick={() => setIsInboxOpen(false)}
                className="w-full py-2 text-xs font-bold text-gray-500 hover:text-green-600 transition-colors"
              >
                Close Inbox
              </button>
            </div>
          </div>
        )}
      </div>

      <ChatModal 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        receiverId={activeChat.id}
        receiverName={activeChat.name}
        productId={activeChat.productId}
        productName={activeChat.productName}
      />
    </>
  );
}
