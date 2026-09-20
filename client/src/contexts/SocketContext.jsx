import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  // Zero hardcoded notifications - only real live updates from platform/admin
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    // Connect to Socket.IO backend (supports VITE_SOCKET_URL or VITE_API_BASE_URL origin)
    const socketEndpoint = import.meta.env.VITE_SOCKET_URL 
      || (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '') : window.location.origin);

    const s = io(socketEndpoint, {
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      console.log('✅ Connected to FasalNiti Real-Time Socket Gateway');
    });

    // Real-time deal confirmation celebration
    s.on('deal_confirmed', (data) => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      const newNotif = {
        id: `notif_deal_${Date.now()}`,
        title: '🎉 सौदा पक्का हुआ! (Deal Confirmed)',
        message: data.message || 'आपका सौदा सफलतापूर्वक पूरा हुआ।',
        time: 'Just now',
        type: 'DEAL_CONFIRMED'
      };
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(c => c + 1);
      setHasUnread(true);
    });

    // Real-time buyer offer received
    s.on('offer_received', (data) => {
      const newNotif = {
        id: `notif_offer_${Date.now()}`,
        title: '💰 नया ऑफर प्राप्त हुआ (Offer Received)',
        message: data.message || 'एक खरीदार ने आपके फसल लॉट पर ऑफर दिया है।',
        time: 'Just now',
        type: 'NEW_OFFER'
      };
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(c => c + 1);
      setHasUnread(true);
    });

    // Real-time Admin / Platform Update (New Scheme, Mandi Alert, System Notice)
    const handlePlatformUpdate = (data) => {
      const newNotif = {
        id: data.id || `notif_plat_${Date.now()}`,
        title: data.title || '📢 नया अपडेट (Platform Update)',
        message: data.message || 'प्लेटफ़ॉर्म पर नई जानकारी जोड़ी गई है।',
        time: data.time || 'Just now',
        type: data.type || 'PLATFORM_UPDATE',
        link: data.link || '/schemes'
      };
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(c => c + 1);
      setHasUnread(true);
    };

    // Real-time User Verification event from Admin
    s.on('user_verified', (data) => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      const newNotif = {
        id: `notif_ver_${Date.now()}`,
        title: '🛡️ खाता सत्यापित हुआ (Profile Verified)',
        message: data.message || 'बधाई हो! आपके खाते को प्रशासक द्वारा आधिकारिक रूप से सत्यापित कर दिया गया है।',
        time: 'Just now',
        type: 'USER_VERIFIED',
        link: '/profile'
      };
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(c => c + 1);
      setHasUnread(true);
    });

    // Real-time Order Tracking Status Update
    s.on('order_status_updated', (data) => {
      const newNotif = {
        id: `notif_ord_${Date.now()}`,
        title: `🚚 ${data.friendlyStage || 'ऑर्डर ट्रैकिंग अपडेट'}`,
        message: data.message || `ऑर्डर #${data.orderNumber} का स्टेटस अपडेट हुआ: ${data.stage}`,
        time: 'Just now',
        type: 'ORDER_UPDATE',
        link: '/farmer'
      };
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(c => c + 1);
      setHasUnread(true);
    });

    s.on('platform_update', handlePlatformUpdate);
    s.on('new_platform_update', handlePlatformUpdate);

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const markAllRead = () => {
    setUnreadCount(0);
    setHasUnread(false);
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, hasUnread, markAllRead }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
