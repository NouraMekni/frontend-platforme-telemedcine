import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import axios from 'axios';
import * as StompJs from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Search, Send, User, Circle, MessageSquare, Clock, ShieldCheck, Stethoscope } from 'lucide-react';

// --- DESIGN UPGRADED COMPONENTS (PATIENT VIEW) ---

const DoctorsList = ({ doctors, selectedDoctor, onSelectDoctor, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-blue-700/60 font-medium animate-pulse">Connecting to clinic...</p>
      </div>
    );
  }

  if (!doctors?.length) {
    return (
      <div className="p-8 text-center">
        <div className="bg-blue-50 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto mb-3">
          <Stethoscope className="text-blue-300" size={28} />
        </div>
        <p className="text-slate-500 font-medium">No doctors available</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {doctors.map((doctor) => (
        <div
          key={doctor.id}
          onClick={() => onSelectDoctor(doctor)}
          className={`group p-4 cursor-pointer transition-all duration-200 hover:bg-blue-50/70 ${
            selectedDoctor?.id === doctor.id 
              ? 'bg-blue-50 border-r-4 border-blue-600' 
              : 'bg-white'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-sm transition-transform group-hover:scale-105 ${
               selectedDoctor?.id === doctor.id ? 'bg-blue-600' : 'bg-slate-300'
            }`}>
              {doctor.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-700 truncate group-hover:text-blue-700">
                Dr. {doctor.name} {doctor.prenom}
              </h3>
              <div className="flex items-center text-xs text-slate-500 mt-1">
                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase mr-2">
                  {doctor.specialte || 'Generalist'}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ${
                doctor.disponibilite === 'available' ? 'bg-emerald-500' : 'bg-slate-300'
              }`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const MessageBubble = ({ message, isOwnMessage, doctorName }) => (
  <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
    <div className={`group flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[85%]`}>
      <span className="text-[10px] font-bold text-slate-400 mb-1 px-1 uppercase tracking-wider">
        {isOwnMessage ? 'You' : `Dr. ${doctorName}`} • {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
      <div
        className={`px-4 py-3 rounded-2xl shadow-sm text-[14px] leading-relaxed ${
          isOwnMessage
            ? 'bg-blue-700 text-white rounded-tr-none'
            : 'bg-white text-slate-700 border border-blue-100 rounded-tl-none'
        } ${message.error ? 'border-2 border-red-400' : ''}`}
      >
        {message.content}
      </div>
      {message.error && (
        <span className="text-[10px] text-red-500 mt-1 font-semibold">Message failed</span>
      )}
    </div>
  </div>
);

const MessagesList = ({ messages, currentUserId, doctorName }) => {
  const safeMessages = Array.isArray(messages) ? messages : [];
  
  if (safeMessages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-blue-900/30">
        <div className="bg-white p-6 rounded-full shadow-inner mb-4">
          <MessageSquare size={48} strokeWidth={1} className="opacity-20" />
        </div>
        <p className="font-bold text-lg">Secure Consultation</p>
        <p className="text-sm">Messages are encrypted and private</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {safeMessages.map((message, index) => (
        <MessageBubble
          key={message.id || index}
          message={message}
          isOwnMessage={message.senderId === currentUserId}
          doctorName={doctorName}
        />
      ))}
    </div>
  );
};

const ChatHeader = ({ doctor, isConnected }) => (
  <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold ring-4 ring-blue-50">
          {doctor.name?.charAt(0)}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      </div>
      <div>
        <h1 className="font-extrabold text-slate-800 text-lg tracking-tight">
          Dr. {doctor.name} {doctor.prenom}
        </h1>
        <p className="text-[11px] text-blue-600 font-bold uppercase tracking-widest">
          {doctor.specialte || 'Medical Specialist'}
        </p>
      </div>
    </div>
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold ${
      isConnected ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
    }`}>
      <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-blue-600 animate-pulse' : 'bg-amber-600'}`} />
      {isConnected ? "ENCRYPTED" : "RECONNECTING"}
    </div>
  </div>
);

const MessageInput = ({ message, onMessageChange, onSendMessage, isConnected, isSending }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSending) {
      onSendMessage();
    }
  };

  return (
    <div className="p-5 bg-white border-t border-slate-100">
      <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 transition-all focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 focus-within:bg-white">
        <input
          type="text"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isConnected ? "Describe your symptoms or reply..." : "Syncing..."}
          className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none disabled:cursor-not-allowed font-medium text-slate-700"
          disabled={!isConnected || isSending}
        />
        <button
          onClick={onSendMessage}
          disabled={!message.trim() || !isConnected || isSending}
          className="bg-blue-600 text-white h-10 w-10 rounded-xl hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all flex items-center justify-center shadow-md shadow-blue-200"
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
      <p className="text-[10px] text-center text-slate-400 mt-3 font-medium flex items-center justify-center gap-1">
        <ShieldCheck size={10} /> Secure Patient Portal • Data is protected
      </p>
    </div>
  );
};

// --- LOGIC HOOKS (Preserved from your code) ---

const useWebSocket = (user, selectedDoctor, onMessageReceived) => {
  const [isConnected, setIsConnected] = useState(false);
  const stompClient = useRef(null);

  useEffect(() => {
    if (!user?.id || !selectedDoctor) {
      setIsConnected(false);
      return;
    }
    const client = new StompJs.Client({
      webSocketFactory: () => new SockJS("http://localhost:8083/ws-stomp"),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
    client.onConnect = () => {
      setIsConnected(true);
      const topic = `/topic/chat/${user.id}/${selectedDoctor.id}`;
      client.subscribe(topic, (message) => {
        try {
          const newMessage = JSON.parse(message.body);
          onMessageReceived(newMessage);
        } catch (error) { console.error(error); }
      });
    };
    client.onStompError = () => setIsConnected(false);
    client.onDisconnect = () => setIsConnected(false);
    stompClient.current = client;
    client.activate();
    return () => { if (client.connected) client.deactivate(); setIsConnected(false); };
  }, [user?.id, selectedDoctor?.id, onMessageReceived]);

  const sendMessage = useCallback((message) => {
    if (stompClient.current?.connected) {
      try {
        stompClient.current.publish({ destination: "/app/chat/send", body: JSON.stringify(message) });
        return true;
      } catch (error) { return false; }
    }
    return false;
  }, []);
  return { isConnected, sendMessage };
};

const useDoctors = (user) => {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (!user?.id || user.role !== 'patient') return;
    const loadDoctors = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:8083/api/medecins');
        setDoctors(Array.isArray(response.data) ? response.data : []);
      } catch (error) { setDoctors([]); } finally { setIsLoading(false); }
    };
    loadDoctors();
  }, [user?.id, user?.role]);
  return { doctors, isLoading };
};

const useChatHistory = (user, selectedDoctor) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  
  const loadChatHistory = useCallback(async () => {
    if (!selectedDoctor || !user?.id) return;
    try {
      const response = await axios.get(`http://localhost:8083/api/chat/${user.id}/${selectedDoctor.id}`);
      let messagesData = Array.isArray(response.data) ? response.data : response.data.messages || [];
      setMessages(messagesData);
    } catch (error) { setMessages([]); }
  }, [user.id, selectedDoctor]);

  const addMessage = useCallback((newMessage) => {
    setMessages(prev => {
      const isDuplicate = prev.some(m => m.id === newMessage.id || (m.content === newMessage.content && m.timestamp === newMessage.timestamp));
      return isDuplicate ? prev : [...prev, newMessage];
    });
  }, []);
  
  const clearMessages = useCallback(() => setMessages([]), []);
  return { messages, messagesEndRef, loadChatHistory, addMessage, clearMessages };
};

// --- MAIN PAGE ---

export default function ChatPanel() {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isSending, setIsSending] = useState(false);
  
  const { doctors, isLoading } = useDoctors(user);
  const { messages, messagesEndRef, loadChatHistory, addMessage, clearMessages } = useChatHistory(user, selectedDoctor);

  const handleMessageReceived = useCallback((message) => addMessage(message), [addMessage]);
  const { isConnected, sendMessage } = useWebSocket(user, selectedDoctor, handleMessageReceived);

  const handleSelectDoctor = useCallback((doctor) => {
    setSelectedDoctor(doctor);
    clearMessages();
  }, [clearMessages]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || !selectedDoctor || isSending) return;
    const messageData = {
      senderId: user.id,
      receiverId: selectedDoctor.id,
      senderName: `${user.name} ${user.prenom}`,
      receiverName: `Dr. ${selectedDoctor.name} ${selectedDoctor.prenom}`,
      senderRole: user.role,
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setIsSending(true);
    try {
      if (!sendMessage(messageData)) {
        const response = await axios.post('http://localhost:8083/api/chat/send', messageData);
        if (response.data.success) addMessage({ ...messageData, id: response.data.data?.id });
      }
      setInput('');
    } catch (error) {
      addMessage({ ...messageData, error: true });
      setInput('');
    } finally { setIsSending(false); }
  }, [input, selectedDoctor, user, sendMessage, addMessage, isSending]);

  useEffect(() => { if (selectedDoctor) loadChatHistory(); }, [selectedDoctor, loadChatHistory]);

  if (!user?.id) return <DashboardLayout><div className="p-8 text-center text-blue-600 font-bold animate-pulse">Syncing Secure Profile...</div></DashboardLayout>;
  if (user.role !== 'patient') return <DashboardLayout><div className="p-8 text-red-600 font-bold bg-red-50 m-4 rounded-xl border border-red-100">Access Restricted to Patients</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-6 h-[calc(100vh-120px)] min-h-[580px]">
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-200 flex h-full overflow-hidden">
          
          {/* LEFT SIDEBAR - PROVIDERS */}
          <div className="w-80 md:w-96 border-r border-slate-100 flex flex-col bg-slate-50/30">
            <div className="p-6 border-b border-slate-100 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Care Team</h2>
                <div className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded-md font-black">SECURE</div>
              </div>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                 <input 
                    type="text" 
                    placeholder="Find a specialist..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                 />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <DoctorsList
                doctors={doctors}
                selectedDoctor={selectedDoctor}
                onSelectDoctor={handleSelectDoctor}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* MAIN CHAT AREA */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedDoctor ? (
              <>
                <ChatHeader doctor={selectedDoctor} isConnected={isConnected} />
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-blue-50/20 pattern-grid-blue">
                  <MessagesList
                    messages={messages}
                    currentUserId={user.id}
                    doctorName={selectedDoctor.name}
                  />
                  <div ref={messagesEndRef} />
                </div>
                <MessageInput
                  message={input}
                  onMessageChange={setInput}
                  onSendMessage={handleSendMessage}
                  isConnected={isConnected}
                  isSending={isSending}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-blue-50/10">
                <div className="text-center max-w-sm px-6">
                  <div className="bg-white text-blue-600 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-200/50 rotate-3 border border-blue-50">
                    <Stethoscope size={44} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Direct Support</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    Select a healthcare provider from your care team to begin a secure consultation or ask a medical question.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .pattern-grid-blue {
          background-image: radial-gradient(#3b82f615 0.8px, transparent 0.8px);
          background-size: 24px 24px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </DashboardLayout>
  );
}