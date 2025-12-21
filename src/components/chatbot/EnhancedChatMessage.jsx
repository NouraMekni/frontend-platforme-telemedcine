import React from 'react';
import { User, Bot, Clock, CheckCircle } from 'lucide-react';

const EnhancedChatMessage = ({ message, isUser, timestamp, messageId }) => {
  const formatTimestamp = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Fonction pour formater le contenu avec markdown basique
  const formatMessageContent = (content) => {
    if (!content) return '';
    
    try {
      // Remplacer les titres **texte** par du gras
      let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Gérer les émojis d'urgence avec style
      formatted = formatted.replace(/🚨 \*\*URGENCE MÉDICALE\*\* 🚨/, 
        '<div class="bg-red-100 border-l-4 border-red-500 p-3 mb-3 rounded"><strong class="text-red-700">🚨 URGENCE MÉDICALE 🚨</strong></div>');
      
      formatted = formatted.replace(/⚠️ \*\*ATTENTION - SYMPTÔMES PRÉOCCUPANTS\*\* ⚠️/, 
        '<div class="bg-orange-100 border-l-4 border-orange-500 p-3 mb-3 rounded"><strong class="text-orange-700">⚠️ ATTENTION - SYMPTÔMES PRÉOCCUPANTS ⚠️</strong></div>');
      
      // Gérer les séparateurs
      formatted = formatted.replace(/═+/g, '<hr class="my-3 border-gray-300" />');
      formatted = formatted.replace(/---/g, '<hr class="my-2 border-gray-200" />');
      
      // Remplacer les puces • par des vraies puces HTML (version simplifiée)
      const lines = formatted.split('\n');
      let inList = false;
      const processedLines = [];
      
      lines.forEach(line => {
        if (line.trim().startsWith('•')) {
          if (!inList) {
            processedLines.push('<ul>');
            inList = true;
          }
          processedLines.push(`<li>${line.trim().substring(1).trim()}</li>`);
        } else {
          if (inList) {
            processedLines.push('</ul>');
            inList = false;
          }
          processedLines.push(line);
        }
      });
      
      if (inList) {
        processedLines.push('</ul>');
      }
      
      formatted = processedLines.join('<br />');
      
      return formatted;
    } catch (error) {
      console.error('Erreur formatage message:', error);
      return content.replace(/\n/g, '<br />');
    }
  };

  return (
    <div className={`flex items-start gap-3 mb-6 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
        isUser 
          ? 'bg-gradient-to-br from-primary-500 to-primary-600' 
          : 'bg-gradient-to-br from-gray-500 to-gray-600'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>
      
      {/* Message Content */}
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isUser ? 'text-right' : 'text-left'}`}>
        {/* Message Bubble */}
        <div className={`rounded-2xl p-4 shadow-sm ${
          isUser 
            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white' 
            : 'bg-white border border-gray-200 text-gray-800'
        }`}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div 
              className="text-sm medical-response"
              dangerouslySetInnerHTML={{ 
                __html: formatMessageContent(message.content || message) 
              }}
            />
          )}
        </div>
        
        {/* Timestamp and Status */}
        {timestamp && (
          <div className={`flex items-center gap-1 mt-2 px-2 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}>
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {formatTimestamp(timestamp)}
            </span>
            {isUser && (
              <CheckCircle className="w-3 h-3 text-green-500 ml-1" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedChatMessage;