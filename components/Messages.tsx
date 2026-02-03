
import React, { useState, useRef, useEffect } from 'react';
import { ICONS, BRAND } from '../constants';
import { Conversation, User, Message } from '../types';

interface MessagesProps {
  currentUser: User;
  allUsers: User[];
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  onUserClick: (user: User) => void;
}

export const Messages: React.FC<MessagesProps> = ({ 
  currentUser, 
  allUsers, 
  conversations, 
  setConversations,
  activeConversationId,
  setActiveConversationId,
  onUserClick
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversationId, conversations]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const participant = activeConversation ? allUsers.find(u => u.id === activeConversation.participantId) : null;

  const handleSend = () => {
    if (!input.trim() || !activeConversationId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      text: input,
      timestamp: Date.now(),
      read: true
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeConversationId) {
        return {
          ...c,
          messages: [...c.messages, newMessage],
          lastMessage: input,
          timestamp: Date.now(),
          unreadCount: 0
        };
      }
      return c;
    }));

    setInput('');
  };

  const openConversation = (convId: string) => {
    setActiveConversationId(convId);
    setConversations(prev => prev.map(c => 
      c.id === convId ? { ...c, unreadCount: 0, messages: c.messages.map(m => ({ ...m, read: true })) } : c
    ));
  };

  if (activeConversation && participant) {
    return (
      <div className="flex-1 flex flex-col bg-black h-full animate-in slide-in-from-right duration-300">
        <header className="px-6 py-8 border-b border-white/5 flex items-center gap-4 sticky top-0 bg-black/50 backdrop-blur-xl z-20">
          <button onClick={() => setActiveConversationId(null)} className="text-zinc-500">
            <ICONS.ArrowLeft className="w-5 h-5" />
          </button>
          <div 
            onClick={() => onUserClick(participant)}
            className="w-10 h-10 rounded-full border border-[#d4af37]/30 p-0.5 cursor-pointer active:scale-95 transition-transform"
          >
            <img src={participant.avatar} className="w-full h-full object-cover rounded-full" alt={participant.fullName} />
          </div>
          <div className="flex-1 cursor-pointer" onClick={() => onUserClick(participant)}>
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white hover:text-[#d4af37] transition-colors">{participant.fullName}</h2>
            <p className="text-[7px] text-[#d4af37] font-black uppercase tracking-widest italic">Online agora</p>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {activeConversation.messages.map((m) => {
            const isMe = m.senderId === currentUser.id;
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-3xl ${
                  isMe 
                    ? 'bg-zinc-900 border border-white/5 text-white rounded-br-none' 
                    : 'bg-white/5 text-zinc-300 rounded-bl-none'
                }`}>
                  <p className="text-[11px] leading-relaxed uppercase tracking-wider">{m.text}</p>
                  <p className="text-[6px] text-zinc-600 font-black mt-2 text-right">
                    {new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 pb-32">
          <div className="relative">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="DIGITE SUA MENSAGEM..."
              className="w-full bg-zinc-900/50 border border-white/10 rounded-full p-6 pr-16 text-[10px] text-white uppercase tracking-widest outline-none focus:border-white/30 transition-all"
            />
            <button 
              onClick={handleSend}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center text-black active:scale-90 transition-transform"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black h-full animate-in fade-in duration-500">
      <header className="px-10 pt-20 pb-8 flex-shrink-0">
        <h1 className="text-5xl font-serif italic text-[#d4af37] tracking-tighter">Mensagens</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 no-scrollbar pb-40">
        {conversations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4 py-20">
            <ICONS.Message className="w-12 h-12" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em]">Nenhuma conversa iniciada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.sort((a, b) => b.timestamp - a.timestamp).map(conv => {
              const part = allUsers.find(u => u.id === conv.participantId);
              if (!part) return null;
              return (
                <div 
                  key={conv.id} 
                  onClick={() => openConversation(conv.id)}
                  className="p-5 bg-zinc-900/20 border border-white/5 rounded-[2rem] flex items-center gap-5 hover:bg-white/5 transition-all cursor-pointer relative group"
                >
                  <div 
                    onClick={(e) => { e.stopPropagation(); onUserClick(part); }}
                    className="w-16 h-16 rounded-full border border-white/10 p-1 flex-shrink-0 active:scale-90 transition-transform"
                  >
                    <img src={part.avatar} className="w-full h-full object-cover rounded-full" alt={part.fullName} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 
                        onClick={(e) => { e.stopPropagation(); onUserClick(part); }}
                        className="text-[12px] font-black uppercase tracking-widest text-white truncate hover:text-[#d4af37] transition-colors"
                      >
                        {part.fullName}
                      </h4>
                      <span className="text-[7px] text-zinc-600 font-black uppercase">
                        {new Date(conv.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`text-[10px] truncate uppercase tracking-wider ${conv.unreadCount > 0 ? 'text-white font-black' : 'text-zinc-500'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-black absolute top-6 right-6 shadow-[0_0_10px_#a855f7] animate-pulse"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
