import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { config, web3Modal } from './lib/web3';
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TripPlanner from "./pages/TripPlanner";
import Subscription from "./pages/Subscription";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import PaymentSuccess from "./pages/PaymentSuccess";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Make web3Modal available globally
    if (web3Modal) {
      window.web3Modal = web3Modal;
    }
  }, []);

  return (
    <ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Analytics />
              <Navbar />
              <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/planner" 
              element={
                <ProtectedRoute>
                  <TripPlanner />
                </ProtectedRoute>
              } 
            />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
</ErrorBoundary>
  );
};

export default App;
