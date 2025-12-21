import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';

const ChatbotButton = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-300 z-50 flex items-center justify-center ${
        isOpen 
          ? 'bg-red-500 hover:bg-red-600' 
          : 'bg-primary-600 hover:bg-primary-700'
      }`}
    >
      {isOpen ? (
        <X className="w-6 h-6 text-white" />
      ) : (
        <MessageSquare className="w-6 h-6 text-white" />
      )}
    </button>
  );
};

export default ChatbotButton;