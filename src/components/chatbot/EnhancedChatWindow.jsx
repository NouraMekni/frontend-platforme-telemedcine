import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, X, Trash2, Lightbulb, MessageSquare, History } from 'lucide-react';
import EnhancedChatMessage from './EnhancedChatMessage';
import ChatHistory from './ChatHistory';
import { useEnhancedChatbotRAG } from '../../hooks/useEnhancedChatbotRAG';

const EnhancedChatWindow = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const { 
    messages, 
    sendMessage, 
    clearMessages,
    getChatHistory,
    clearChatHistory,
    isLoading, 
    getSuggestedQuestions 
  } = useEnhancedChatbotRAG();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      await sendMessage(input.trim());
      setInput('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleClearChat = () => {
    if (window.confirm('Êtes-vous sûr de vouloir effacer toute la conversation ?')) {
      clearMessages();
    }
  };

  const handleShowHistory = () => {
    setShowHistory(true);
  };

  const handleSelectHistory = (historyEntry) => {
    setShowHistory(false);
    // Ici on pourrait charger une conversation passée
    console.log('Sélection historique:', historyEntry);
  };

  if (!isOpen) return null;

  const suggestedQuestions = getSuggestedQuestions();
  const chatHistory = getChatHistory();

  return (
    <>
      <div className="fixed top-4 right-6 w-[28rem] h-[calc(100vh-8rem)] max-h-[32rem] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">Assistant Médical IA</h3>
              <p className="text-sm opacity-90 truncate">Analyse intelligente de symptômes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleShowHistory}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Voir l'historique"
            >
              <History className="w-4 h-4" />
            </button>
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Effacer la conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-primary-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Bonjour ! 👋</h4>
            <p className="text-sm text-gray-600 mb-4">
              Je suis votre assistant médical intelligent. Décrivez vos symptômes et je vous aiderai à les analyser.
            </p>
            
            {!showSuggestions && (
              <button
                onClick={() => setShowSuggestions(true)}
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                <Lightbulb className="w-4 h-4" />
                Voir des exemples de questions
              </button>
            )}
            
            {showSuggestions && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-500 mb-3">💡 Exemples de questions :</p>
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(question)}
                    className="block w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <EnhancedChatMessage
                key={message.id || index}
                message={message}
                isUser={message.isUser}
                timestamp={message.timestamp}
                messageId={message.id}
              />
            ))}
          </div>
        )}
        
        {/* Indicateur de chargement supprimé */}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Décrivez vos symptômes en détail..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-primary-600 text-white p-3 rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            ⚠️ Cette IA ne remplace pas un diagnostic médical professionnel
          </div>
        </form>
      </div>
    </div>

    {/* Chat History Component */}
    <ChatHistory
      isOpen={showHistory}
      onClose={() => setShowHistory(false)}
      history={chatHistory}
      onClearHistory={clearChatHistory}
      onSelectHistory={handleSelectHistory}
    />
  </>
  );
};

export default EnhancedChatWindow;