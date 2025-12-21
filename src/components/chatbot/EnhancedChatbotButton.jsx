import React, { useState } from 'react';
import { MessageSquare, X, Stethoscope } from 'lucide-react';

const EnhancedChatbotButton = ({ onClick, isOpen, messageCount = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-12 right-6 z-50">
      {/* Notification badge */}
      {messageCount > 0 && !isOpen && (
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold animate-pulse">
          {messageCount > 9 ? '9+' : messageCount}
        </div>
      )}
      
      {/* Tooltip */}
      {isHovered && !isOpen && (
        <div className="absolute bottom-16 right-0 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
          Assistant Médical IA
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
      
      {/* Main Button */}
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative w-16 h-16 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center transform hover:scale-110 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-0' 
            : 'bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700'
        }`}
        style={{
          filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))'
        }}
      >
        {/* Background pulse effect */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-20"></div>
        )}
        
        {/* Icon */}
        <div className="relative z-10">
          {isOpen ? (
            <X className="w-7 h-7 text-white transition-transform duration-300" />
          ) : (
            <div className="relative">
              <MessageSquare className="w-7 h-7 text-white transition-transform duration-300 group-hover:scale-110" />
              <Stethoscope className="w-4 h-4 text-white absolute -bottom-1 -right-1 opacity-90" />
            </div>
          )}
        </div>
        
        {/* Ripple effect on click */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-active:opacity-20 group-active:animate-ping"></div>
        </div>
      </button>
      
      {/* Status indicator */}
      <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white transition-colors duration-300 ${
        isOpen ? 'bg-green-400' : 'bg-blue-400'
      }`}>
        <div className={`w-full h-full rounded-full animate-pulse ${
          isOpen ? 'bg-green-400' : 'bg-blue-400'
        }`}></div>
      </div>
    </div>
  );
};

export default EnhancedChatbotButton;