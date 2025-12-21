import React, { useState } from 'react';
import ChatbotButton from '../components/ChatbotButton';
import ChatWindow from '../components/ChatWindow';

const MedicalChatbot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      <ChatbotButton onClick={toggleChat} isOpen={isChatOpen} />
      <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

export default MedicalChatbot;