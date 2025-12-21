import React from 'react';
import { User, Bot } from 'lucide-react';

const ChatMessage = ({ message, isUser, timestamp }) => {
  return (
    <div className={`flex items-start gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary-500' : 'bg-gray-500'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>
      
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`rounded-lg p-3 ${
          isUser 
            ? 'bg-primary-500 text-white' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{message}</p>
        </div>
        {timestamp && (
          <p className="text-xs text-gray-500 mt-1 px-1">
            {new Date(timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;