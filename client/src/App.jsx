import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import OfflineBanner from './components/OfflineBanner';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import FloatingAiChatWidget from './components/FloatingAiChatWidget';
import ErrorBoundary from './components/ErrorBoundary';

import LandingPage from './pages/LandingPage';
import FarmerDashboard from './pages/FarmerDashboard';
import DecisionEnginePage from './pages/DecisionEnginePage';
import MarketIntelligencePage from './pages/MarketIntelligencePage';
import GovernmentSchemesPage from './pages/GovernmentSchemesPage';
import BuyerMarketplacePage from './pages/BuyerMarketplacePage';
import LogisticsStoragePage from './pages/LogisticsStoragePage';
import FPODashboard from './pages/FPODashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import HelpContactPage from './pages/HelpContactPage';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSchemes from './pages/admin/AdminSchemes';
import AdminTickets from './pages/admin/AdminTickets';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SocketProvider } from './contexts/SocketContext';
import { LocationProvider } from './contexts/LocationContext';

export default function App() {
  const [voiceOpen, setVoiceOpen] = useState(false);

  useEffect(() => {
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/service-worker.js').catch(err => {
        console.warn('SW registration failed:', err);
      });
    }
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <LocationProvider>
          <SocketProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
              
              {/* Navbar */}
              <Navbar 
                onOpenVoice={() => setVoiceOpen(true)} 
              />

              {/* Offline Notification Banner */}
              <OfflineBanner />

              {/* Main Routing Area */}
              <main className="flex-1 pb-20 lg:pb-0">
                <ErrorBoundary>
                  <Routes>
                    <Route 
                      path="/" 
                      element={
                        <LandingPage 
                          onOpenVoice={() => setVoiceOpen(true)} 
                        />
                      } 
                    />
                    <Route 
                      path="/dashboard" 
                      element={
                        <FarmerDashboard 
                          onOpenVoice={() => setVoiceOpen(true)} 
                        />
                      } 
                    />
                    <Route path="/decision" element={<DecisionEnginePage />} />
                    <Route path="/market" element={<MarketIntelligencePage />} />
                    <Route path="/schemes" element={<GovernmentSchemesPage />} />
                    <Route path="/buyers" element={<BuyerMarketplacePage />} />
                    <Route path="/logistics" element={<LogisticsStoragePage />} />
                    <Route path="/fpo" element={<FPODashboard />} />
                    <Route path="/buyer" element={<BuyerDashboard />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/help" element={<HelpContactPage />} />

                    {/* Isolated Administration & Governance Portal */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="schemes" element={<AdminSchemes />} />
                      <Route path="tickets" element={<AdminTickets />} />
                      <Route path="audit-logs" element={<AdminAuditLogs />} />
                      <Route path="analytics" element={<AdminAnalyticsPage />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </ErrorBoundary>
              </main>

              {/* Mobile Bottom Navigation Bar */}
              <MobileBottomNav onOpenVoice={() => setVoiceOpen(true)} />

              {/* Floating AI Chatbot Widget */}
              <FloatingAiChatWidget onOpenVoice={() => setVoiceOpen(true)} isOpen={voiceOpen} />

              {/* Voice Assistant Modal */}
              <VoiceAssistantModal 
                isOpen={voiceOpen} 
                onClose={() => setVoiceOpen(false)} 
              />

              {/* Responsive Footer */}
              <AppFooter />

            </div>
          </BrowserRouter>
        </SocketProvider>
      </LocationProvider>
    </AuthProvider>
  </LanguageProvider>
  );
}

function AppFooter() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-bold text-slate-700">
          <span>🌾 KisanSetu AI</span>
          <span>•</span>
          <span className="text-emerald-700">National Farmer Market Linkage & Fair Price Discovery Platform</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Govt Agmarknet & e-NAM API Compatible Gateway • Direct Farmgate Value Realization
        </div>
      </div>
    </footer>
  );
}
