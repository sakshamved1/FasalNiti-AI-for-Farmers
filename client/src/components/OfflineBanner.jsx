import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md sticky top-16 z-30">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>Offline Mode — Showing cached mandi prices and saved schemes. Data will auto-sync when connection restores.</span>
      </div>
      <span className="text-[10px] bg-amber-600/30 px-2 py-0.5 rounded">
        Last updated 10 mins ago
      </span>
    </div>
  );
}
