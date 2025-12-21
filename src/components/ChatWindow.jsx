import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { useChatbotRAG } from '../hooks/useChatbotRAG';

const ChatWindow = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { messages, sendMessage, isLoading } = useChatbotRAG();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      await sendMessage(input.trim());
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-primary-600 text-white p-4 rounded-t-lg">
        <h3 className="font-semibold">Assistant Médical IA</h3>
        <p className="text-sm opacity-90">Posez vos questions de santé</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-sm">👋 Bonjour ! Je suis votre assistant médical.</p>
            <p className="text-xs mt-2">Décrivez vos symptômes ou posez une question de santé.</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Loader className="w-4 h-4 animate-spin" />
            <span>L'assistant réfléchit...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Décrivez vos symptômes..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          ⚠️ Cette IA ne remplace pas un avis médical professionnel
        </p>
      </form>
    </div>
  );
};

export default ChatWindow;