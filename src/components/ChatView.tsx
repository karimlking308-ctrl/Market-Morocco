import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Send, User, Store, MessageSquare, Phone, Info } from 'lucide-react';
import { TRANSLATIONS } from '../db/translations';
import { ChatRoom, ChatMessage, UserProfile, Store as StoreType } from '../types';

interface ChatViewProps {
  language: 'ar' | 'fr';
  rooms: ChatRoom[];
  currentUser: UserProfile;
  stores: StoreType[];
  onSendMessage: (roomId: string, content: string) => void;
  onSelectRoom: (roomId: string) => void;
  activeRoomId: string | null;
}

export default function ChatView({
  language,
  rooms,
  currentUser,
  stores,
  onSendMessage,
  onSelectRoom,
  activeRoomId
}: ChatViewProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeRoom = useMemo(() => {
    return rooms.find(r => r.id === activeRoomId) || null;
  }, [rooms, activeRoomId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeRoom?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoom || !newMessage.trim()) return;
    onSendMessage(activeRoom.id, newMessage);
    setNewMessage('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-850 h-[600px] flex overflow-hidden shadow-sm" id="chat-view-container">
      
      {/* Rooms Sidebar */}
      <div className="w-1/3 border-r border-gray-100 dark:border-gray-850 flex flex-col h-full bg-gray-50/50 dark:bg-slate-900/50">
        <div className="p-4 border-b border-gray-100 dark:border-gray-850 font-black text-xs text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4 text-morocco-red" />
          <span>{t.messages}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-850">
          {rooms.length === 0 ? (
            <p className="p-4 text-[10px] text-gray-400 text-center mt-6">لا توجد محادثات نشطة حالياً.</p>
          ) : (
            rooms.map((room) => {
              const otherPartyName = currentUser.id === room.buyerId ? room.storeName : room.buyerName;
              const lastMsg = room.messages[room.messages.length - 1];
              const isSelected = room.id === activeRoomId;

              return (
                <div
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/40 transition flex items-center gap-3 ${
                    isSelected ? 'bg-morocco-red/5 border-r-4 border-morocco-red dark:bg-morocco-red/5' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                    {otherPartyName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                      {otherPartyName}
                    </h4>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">
                      {lastMsg ? lastMsg.content : 'بدء الدردشة الآن...'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Conversation area */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900">
        {activeRoom ? (
          <>
            {/* Active Header details */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-extrabold text-morocco-red">
                  {currentUser.id === activeRoom.buyerId ? activeRoom.storeName.slice(0, 2).toUpperCase() : activeRoom.buyerName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white">
                    {currentUser.id === activeRoom.buyerId ? activeRoom.storeName : activeRoom.buyerName}
                  </h3>
                  <span className="text-[9px] text-morocco-green font-bold flex items-center gap-0.5 mt-0.5">
                    ● متصل الآن (Online)
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 font-bold flex items-center gap-1 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-gray-200/50">
                <Info className="h-3.5 w-3.5" />
                <span>ID: {activeRoom.id}</span>
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
              {activeRoom.messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-morocco-red text-white rounded-br-none font-semibold shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-gray-200 rounded-bl-none border border-gray-150 dark:border-gray-800 shadow-sm'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <span className={`block text-[8px] mt-1 text-right ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input sender */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-gray-850 flex gap-2">
              <input
                type="text"
                required
                placeholder={t.typeMessage || 'اكتب رسالة البائع هنا...'}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-morocco-red"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-morocco-red hover:bg-morocco-red/90 text-white transition-all shadow-sm"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">{language === 'ar' ? 'حدد محادثة لبدء الدردشة' : 'Sélectionner une discussion'}</h3>
            <p className="text-xs text-gray-400 max-w-xs mt-1">يمكنك مراسلة البائعين مباشرة من صفحة تفاصيل أي منتج لعرض استفساراتك.</p>
          </div>
        )}
      </div>

    </div>
  );
}
