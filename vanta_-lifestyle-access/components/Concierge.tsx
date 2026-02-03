
import React, { useState, useRef, useEffect } from 'react';
import { ICONS, BRAND } from '../constants';
import { getVantaConciergeResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

export const Concierge: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Bem-vindo ao Vanta Concierge. Como posso elevar seu acesso hoje?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await getVantaConciergeResponse(input, history);
    
    const modelMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: response || '', timestamp: Date.now() };
    setMessages(prev => [...prev, modelMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-black h-full">
      <div className="px-6 py-8 border-b border-white/5 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_#a855f7]"></div>
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white">Vanta Concierge</h2>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-3xl ${
              m.role === 'user' 
                ? 'bg-zinc-900 border border-white/5 text-white rounded-br-none' 
                : 'bg-white/5 text-zinc-300 rounded-bl-none'
            }`}>
              <p className="text-[11px] leading-relaxed uppercase tracking-wider">{m.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 p-4 rounded-3xl rounded-bl-none animate-pulse">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 pb-32">
        <div className="relative">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="SOLICITAR ACESSO, UPGRADE..."
            className="w-full bg-zinc-900/50 border border-white/10 rounded-full p-6 pr-16 text-[10px] text-white uppercase tracking-widest outline-none focus:border-purple-500/50 transition-all"
          />
          <button 
            onClick={handleSend}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center text-black"
          >
            <ICONS.Explore className="w-4 h-4 rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
};
