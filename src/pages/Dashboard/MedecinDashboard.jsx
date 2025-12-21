import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { over } from 'stompjs';
import SockJS from 'sockjs-client';

// Icons simulated with Lucide-style SVG paths for a clean look
const BellIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const UserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;

const samplePatients = [
  { id: 1, name: 'Amina Ben Salah', lastVisit: 'Hier' },
  { id: 2, name: 'Mohamed Kharrat', lastVisit: '2 jours' },
  { id: 3, name: 'Nour Kammoun', lastVisit: '3 jours' }
];

export default function MedecinDashboard() {
  const { user } = useAuth();
  const [specialite, setSpecialite] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionRef = useRef(null);
  const stompClient = useRef(null);

  const notificationAnalytics = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    read: notifications.filter(n => n.read).length,
    unreadPercentage: notifications.length > 0 
      ? Math.round((notifications.filter(n => !n.read).length / notifications.length) * 100)
      : 0
  };

  // --- LOGIC REMAINS UNCHANGED ---
  useEffect(() => {
    if (!user || !user.id) return;
    fetch(`http://localhost:8083/api/medecins/${user.id}`, { credentials: 'include' })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => setSpecialite(data.specialte || 'Médecine générale'))
      .catch(() => setSpecialite('Médecine générale'));
  }, [user]);

  useEffect(() => {
    if (!user || !user.id) return;
    fetch(`http://localhost:8083/api/notifications/medecin/${user.id}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((n) => ({
          id: n.id,
          message: n.message,
          timestamp: n.timestamp || new Date().toLocaleString('fr-FR'),
          read: n.read || false
        }));
        setNotifications(mapped);
      });
  }, [user]);

  useEffect(() => {
    if (!user || !user.id) return;
    const socket = new SockJS('http://localhost:8083/ws-stomp');
    stompClient.current = over(socket);
    stompClient.current.debug = null; // Quiet logs for cleaner console

    stompClient.current.connect({}, () => {
      setIsConnected(true);
      const topic = `/topic/medecin-${user.id}`;
      subscriptionRef.current = stompClient.current.subscribe(topic, (message) => {
        let notifObj;
        try { notifObj = JSON.parse(message.body); } 
        catch { notifObj = { message: message.body }; }

        const formattedNotif = {
          id: notifObj.id || Date.now(),
          message: notifObj.message || 'Nouvelle notification',
          timestamp: notifObj.timestamp || new Date().toLocaleString('fr-FR'),
          read: false
        };
        setNotifications((prev) => {
          if (prev.find((n) => n.id === formattedNotif.id)) return prev;
          return [formattedNotif, ...prev];
        });
      });
    }, () => setIsConnected(false));

    return () => {
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
      if (stompClient.current?.connected) stompClient.current.disconnect();
    };
  }, [user]);

  const handleDeleteNotification = (id) => {
    fetch(`http://localhost:8083/api/notifications/${id}`, { method: 'DELETE', credentials: 'include' })
      .then((res) => res.ok && setNotifications((prev) => prev.filter((n) => n.id !== id)));
  };

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
  {/* Left Side: Welcome & Date */}
  <div className="relative">
    {/* Decorative element for a professional touch */}
    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-600 rounded-full hidden md:block" />
    
    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
      Bonjour, <span className="text-blue-600">Dr. {user?.name?.split(' ')[0] || 'Chercheur'}</span>
    </h1>
    
    <div className="flex items-center gap-2 mt-3">
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100/50">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider">Activité en direct</span>
      </div>
      <p className="text-slate-500 text-sm font-medium">
        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
    </div>
  </div>

  {/* Right Side: Profile/Specialty Badge */}
  <div className="group flex items-center gap-4 bg-white/80 backdrop-blur-md p-2 pr-6 rounded-[1.5rem] shadow-sm border border-slate-200/60 hover:shadow-md hover:border-blue-200 transition-all duration-300">
    <div className="relative">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform duration-300">
        <UserIcon />
      </div>
      {/* Small online indicator on the icon */}
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
    </div>
    
    <div className="flex flex-col">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] leading-tight">
        Spécialité
      </span>
      <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
        {specialite || 'Chargement...'}
      </span>
    </div>

    {/* Subtle chevron to imply clickability (optional) */}
    <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
    </svg>
  </div>
</div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Analytics Section */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><BellIcon /></span>
                Aperçu des notifications
              </h3>
              {notificationAnalytics.unread > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl transition-all"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total', value: notificationAnalytics.total, color: 'blue' },
                { label: 'Non lues', value: notificationAnalytics.unread, color: 'orange' },
                { label: 'Lues', value: notificationAnalytics.read, color: 'emerald' },
                { label: 'Ratio', value: `${notificationAnalytics.unreadPercentage}%`, color: 'indigo' }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 transition-hover hover:border-blue-200">
                  <div className={`text-2xl font-black text-${stat.color}-600`}>{stat.value}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
               <div className="flex justify-between items-center px-1">
                  <span className="text-sm font-bold text-slate-600 tracking-tight">Efficacité de lecture</span>
                  <span className="text-sm font-black text-blue-600">{100 - notificationAnalytics.unreadPercentage}%</span>
               </div>
               <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-700 ease-out"
                    style={{ width: `${100 - notificationAnalytics.unreadPercentage}%` }}
                  />
               </div>
            </div>
          </div>

          {/* Notifications List Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h3 className="font-bold text-slate-800">Flux d'activités</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                   <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{isConnected ? 'Live' : 'Offline'}</span>
                </div>
                {notifications.length > 0 && (
                  <button onClick={() => setNotifications([])} className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors uppercase">Effacer</button>
                )}
              </div>
            </div>

            <div className="p-2 max-h-[500px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <BellIcon />
                  </div>
                  <p className="text-slate-400 font-medium">Aucune nouvelle notification</p>
                </div>
              ) : (
                <ul className="space-y-2 p-2">
                  {notifications.map((n) => (
                    <li key={n.id} className={`group relative rounded-2xl transition-all duration-200 ${n.read ? 'bg-white opacity-75' : 'bg-blue-50/50 border-l-4 border-blue-500 shadow-sm'}`}>
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {!n.read && <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0" />}
                          <div className="cursor-pointer" onClick={() => !n.read && handleMarkAsRead(n.id)}>
                            <p className={`text-sm ${n.read ? 'text-slate-500' : 'text-slate-800 font-bold'}`}>{n.message}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-tight">{n.timestamp}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!n.read && (
                            <button onClick={() => handleMarkAsRead(n.id)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" title="Lu">✓</button>
                          )}
                          <button onClick={() => handleDeleteNotification(n.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-lg shadow-blue-200">
             <h3 className="font-bold mb-4 flex items-center gap-2">
               <UserIcon /> Mes Patients
             </h3>
             <ul className="space-y-3">
                {samplePatients.map((p) => (
                  <li key={p.id} className="bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-3 cursor-pointer">
                    <p className="text-sm font-bold">{p.name}</p>
                    <p className="text-[10px] text-blue-100 font-medium">Dernier rdv: {p.lastVisit}</p>
                  </li>
                ))}
             </ul>
             <button className="w-full mt-6 py-3 bg-white text-blue-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-50 transition-colors">
               Voir tout
             </button>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
             <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-widest">Statut Système</h3>
             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold text-slate-500">Connexion</span>
                <span className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase ${isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {isConnected ? 'Actif' : 'Erreur'}
                </span>
             </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}