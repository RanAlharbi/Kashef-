/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ChatMessage } from '../types';
import { 
  Send, 
  Bot, 
  User, 
  ShieldAlert, 
  Terminal, 
  HelpCircle,
  MessageSquare,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const SecurityChat: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialPrompts = [
    { labelEn: "How to spot typosquatting links?", labelAr: "كيف أكشف الروابط المزيفة الملتوية؟" },
    { labelEn: "Explain SMS/WhatsApp package scams", labelAr: "اشرح احتيال الرسائل النصية والطرود" },
    { labelEn: "What is SMS SIM swap hijack?", labelAr: "ما هو هجوم استنساخ شريحة الهاتف؟" },
    { labelEn: "How does bank OTP theft happen?", labelAr: "كيف تتم سرقة رموز التحقق المصرفية؟" },
  ];

  const welcomeMessage = () => {
    const welcomeId = "welcome_" + Date.now();
    setMessages([
      {
        id: welcomeId,
        sender: 'assistant',
        content: isRtl 
          ? "مرحباً بك في مساعد كاشف السيبراني الذكي 🛡️. يمكنك سؤالي عن أي شيء يخص الروابط المريبة، الرسائل النصية، الحسابات المالية، أمان البريد الإلكتروني، أو كيفية تفعيل المصادقة الثنائية وتأمين حساباتك."
          : "Welcome to Kashef Digital Defense AI Assistant 🛡️. Ask me to dissect suspicious SMS alerts, fake packages messages, bank account requests, password security guidelines, or MFA setup configurations.",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  useEffect(() => {
    welcomeMessage();
  }, [isRtl]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || loading) return;

    setInputText('');
    setLoading(true);

    const userMsgId = "msg_" + Math.random().toString(36).substr(2, 9);
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);

    try {
      // Map message structure to what the server expects
      const payloadMessages = updatedMessages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      if (!response.ok) throw new Error("Chat assistance error");
      const data = await response.json();

      const assistantMsgId = "msg_" + Math.random().toString(36).substr(2, 9);
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        sender: 'assistant',
        content: data.text || "I was unable to process this threat. Please try another query.",
        timestamp: new Date().toISOString()
      }]);

    } catch (err) {
      console.error(err);
      const errorMsgId = "msg_" + Math.random().toString(36).substr(2, 9);
      setMessages(prev => [...prev, {
        id: errorMsgId,
        sender: 'assistant',
        content: isRtl 
          ? "عذراً، حدث خطأ في شبكة كاشف الذكية. يرجى المحاولة مرة أخرى." 
          : "Apologies, communication with Kashef AI Node was interrupted. Please re-send your inquiry.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    welcomeMessage();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-140px)] flex flex-col space-y-4 text-slate-100">
      
      {/* Header Info */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-1.5">
              <span>{isRtl ? 'مساعد كاشف الأمني الذكي' : 'Kashef Security Advisor'}</span>
              <Sparkles className="w-4 h-4 text-rose-500" />
            </h1>
            <p className="text-xs text-slate-400">
              {isRtl ? 'خبير الذكاء الاصطناعي السيبراني متاح لمساعدتك على مدار الساعة' : 'AI Specialist in defensive cyber intelligence & digital hygiene'}
            </p>
          </div>
        </div>
        
        <button 
          id="clear-chat-btn"
          onClick={clearChat}
          className="p-2 text-slate-500 hover:text-white hover:bg-slate-900 rounded-lg transition"
          title={isRtl ? 'تصفير المحادثة' : 'Clear Chat log'}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main chat window scroll box */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-950/40 border border-slate-900 rounded-2xl space-y-4 min-h-[300px]">
        {messages.map((m) => {
          const isBot = m.sender === 'assistant';
          return (
            <div 
              key={m.id} 
              id={`chat-msg-${m.id}`}
              className={`flex gap-3 max-w-[85%] ${isBot ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                isBot 
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                  : 'bg-slate-800 border-slate-750 text-slate-300'
              }`}>
                {isBot ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                isBot 
                  ? 'bg-slate-900/60 border border-slate-850 text-slate-200' 
                  : 'bg-rose-600 text-white font-medium'
              }`}>
                <div className="prose prose-invert prose-xs font-sans max-w-none whitespace-pre-line">
                  {m.content}
                </div>
                <div className={`text-[10px] mt-2 ${isBot ? 'text-slate-500' : 'text-rose-200'}`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-[80%] mr-auto text-left">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
              <Bot className="w-4.5 h-4.5 animate-spin-slow" />
            </div>
            <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl text-slate-400 text-xs flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce delay-100" />
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce delay-200" />
              <span>[KASHEF_NODE_THINKING]</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Recommended Pre-seeded prompts */}
      {messages.length <= 1 && (
        <div className="space-y-2 text-left">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>{isRtl ? 'اقتراحات سريعة للاستفسار:' : 'PRE-CONFIGURED DEFENSIBILITY QUERIES:'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {initialPrompts.map((p, idx) => (
              <button
                id={`chat-prompt-btn-${idx}`}
                key={idx}
                onClick={() => handleSendMessage(isRtl ? p.labelAr : p.labelEn)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 font-medium rounded-xl border border-slate-850 hover:border-slate-800 transition"
              >
                {isRtl ? p.labelAr : p.labelEn}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input row */}
      <div className="flex gap-2">
        <input
          id="chat-user-input"
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          placeholder={t.chatPlaceholder}
          className="flex-1 p-3.5 bg-slate-950 border border-slate-900 focus:border-rose-500 focus:outline-none rounded-xl text-white text-sm transition"
        />
        <button
          id="send-chat-msg-btn"
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || loading}
          className="p-3.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};
