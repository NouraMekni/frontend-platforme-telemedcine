import React, { useState, useEffect } from 'react';
import EnhancedChatbotButton from './EnhancedChatbotButton';
import EnhancedChatWindow from './EnhancedChatWindow';

const EnhancedMedicalChatbot = ({ 
  isVisible = true, 
  position = 'bottom-right',
  theme = 'primary' 
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  // Gérer la visibilité du chatbot
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isChatOpen) {
        setIsChatOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isChatOpen]);

  // Gérer le compteur de messages (simulation)
  useEffect(() => {
    const savedMessages = localStorage.getItem('medical_chatbot_messages');
    if (savedMessages) {
      try {
        const messages = JSON.parse(savedMessages);
        // Compter les messages non lus (simulation - dans une vraie app, 
        // vous auriez un système de messages non lus)
        setMessageCount(0);
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);
      }
    }
  }, []);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setMessageCount(0); // Reset du compteur quand on ouvre le chat
    }
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  // Styles pour les différentes positions
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      default:
        return 'bottom-6 right-6';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      {/* Overlay pour fermer le chat en cliquant à l'extérieur */}
      {isChatOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={handleCloseChat}
        />
      )}
      
      {/* Bouton du chatbot */}
      <div className="relative z-50">
        <EnhancedChatbotButton 
          onClick={toggleChat} 
          isOpen={isChatOpen}
          messageCount={messageCount}
        />
        
        {/* Fenêtre de chat */}
        <EnhancedChatWindow 
          isOpen={isChatOpen} 
          onClose={handleCloseChat}
        />
      </div>
    </div>
  );
};

export default EnhancedMedicalChatbot;