import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import {
  Plane,
  MapPin,
  Calendar,
  DollarSign,
  Compass,
  Bot,
  Settings,
  User,
  Search,
} from 'lucide-react';
import { AuthProvider, useAuth } from './components/Auth/AuthProvider';
import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignupForm';
import ErrorBoundary from './components/ErrorBoundary';
import AuthCallback from './pages/AuthCallback';
import { initTelegramWebApp, isTelegramWebApp } from './telegram-webapp';

// Lazy load heavy components to reduce initial bundle size
const TripPlanner = lazy(() => import('./components/TripPlanner'));
const Destinations = lazy(() => import('./components/Destinations'));
const BudgetTracker = lazy(() => import('./components/BudgetTracker'));
const TripHistory = lazy(() => import('./components/TripHistory'));
const AIAssistant = lazy(() => import('./components/AIAssistant'));

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'planned' | 'ongoing' | 'completed';
  image: string;
}

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('planner');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Check if we're on an auth callback page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    // Check for auth callback parameters
    if (
      urlParams.get('access_token') ||
      urlParams.get('error') ||
      hashParams.get('access_token') ||
      hashParams.get('error')
    ) {
      // We're on an auth callback page, let AuthCallback component handle it
      return;
    }
  }, []);

  // Initialize Telegram WebApp
  useEffect(() => {
    if (isTelegramWebApp()) {
      initTelegramWebApp();
    }
  }, []);
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: '1',
      destination: 'Tokyo, Japan',
      startDate: '2024-03-15',
      endDate: '2024-03-22',
      budget: 2500,
      status: 'planned',
      image:
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
    },
    {
      id: '2',
      destination: 'Paris, France',
      startDate: '2024-04-10',
      endDate: '2024-04-17',
      budget: 1800,
      status: 'planned',
      image:
        'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400',
    },
  ]);

  const tabs = [
    { id: 'planner', label: 'Trip Planner', icon: Compass },
    { id: 'destinations', label: 'Destinations', icon: MapPin },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'history', label: 'History', icon: Calendar },
    { id: 'ai', label: 'Amrikyy AI', icon: Bot },
  ];

  const renderContent = () => {
    const LoadingSpinner = () => (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );

    return (
      <Suspense fallback={<LoadingSpinner />}>
        {(() => {
          switch (activeTab) {
            case 'planner':
              return <TripPlanner trips={trips} setTrips={setTrips} />;
            case 'destinations':
              return <Destinations />;
            case 'budget':
              return <BudgetTracker trips={trips} />;
            case 'history':
              return <TripHistory trips={trips} />;
            case 'ai':
              return <AIAssistant />;
            default:
              return <TripPlanner trips={trips} setTrips={setTrips} />;
          }
        })()}
      </Suspense>
    );
  };

  // Check if we're on an auth callback page and show the callback component
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));

  if (
    urlParams.get('access_token') ||
    urlParams.get('error') ||
    hashParams.get('access_token') ||
    hashParams.get('error')
  ) {
    return <AuthCallback />;
  }

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold amrikyy-text">Amrikyy</h1>
          <p className="text-gray-600 mt-2">Loading your AI platform...</p>
        </div>
      </div>
    );
  }

  // Show auth forms if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {authMode === 'login' ? (
            <LoginForm
              onSuccess={() => {
                /* Handle login success */
              }}
              onSwitchToSignup={() => setAuthMode('signup')}
            />
          ) : (
            <SignupForm
              onSuccess={() => {
                /* Handle signup success */
              }}
              onSwitchToLogin={() => setAuthMode('login')}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-effect p-6 shadow-lg"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="p-3 amrikyy-gradient rounded-xl">
              <Plane className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold amrikyy-text">Amrikyy</h1>
              <p className="text-gray-600 text-sm">
                Your AI Automation Platform
              </p>
            </div>
          </motion.div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Search className="w-5 h-5 text-gray-700" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-700" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <User className="w-5 h-5 text-gray-700" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Navigation Tabs */}
      <motion.nav
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-7xl mx-auto px-6 py-4"
      >
        <div className="flex space-x-1 bg-white/20 backdrop-blur-sm rounded-2xl p-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.nav>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto px-6 pb-8"
      >
        {renderContent()}
      </motion.main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
