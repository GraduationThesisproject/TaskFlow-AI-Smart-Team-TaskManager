import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@taskflow/theme';
import { useAuth } from './hooks/useAuth';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch } from './store';
import { checkAuthStatus } from './store/slices/authSlice';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WorkSpace from './pages/workSpace';
import { SpacePage } from './pages/space.page';
import { BoardPage } from './pages/board.page';
import { LandingPage } from './pages/LandingPage';
import SignIn from './layouts/Landing/SignIn';
import SignUP from './layouts/Landing/SignUP';
import EmailVerification from './layouts/Landing/EmailVerif';
import OAuthCallback from './components/auth/OAuthCallback';
import { LogoutConfirmDialog, AppLayout } from './components';
import { AccessibilityProvider } from './components/common/AccessibilityProvider';
import UniversalNavbar from './components/common/navbar/UniversalNavbar';
import Dashboard from './pages/Dashboard';
import { NoAccessPage } from './pages/NoAccessPage';
import ChatPage from './pages/ChatPage';
import ChatWidget from './components/chat/ChatWidget';
import { MessageCircle, X } from 'lucide-react';
import { SocketProvider } from './contexts/SocketContext';
import { SocketDebugger } from './components/debug/SocketDebugger';
import { SocketConnectionTest } from './components/debug/SocketConnectionTest';

// Support Page Component
const SupportPage = () => {
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Customer Support</h1>
          <p className="text-muted-foreground text-lg">
            Need help? Our support team is here to assist you 24/7.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3">
                <p><strong>Email:</strong> support@taskflow.com</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Hours:</strong> 24/7 Support</p>
              </div>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-4">Quick Help</h3>
              <div className="space-y-3">
                <p>• <a href="/docs" className="text-blue-500 hover:underline">Documentation</a></p>
                <p>• <a href="/faq" className="text-blue-500 hover:underline">FAQ</a></p>
                <p>• <a href="/community" className="text-blue-500 hover:underline">Community Forum</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Widget for Support Page */}
      <ChatWidget 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </div>
  );
};

function AppContent() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Initializing...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <AppLayout>
      {/* Universal Navbar - Always displayed */}
      <UniversalNavbar 
        user={user || undefined}
        onLogout={handleLogout}
        isAuthenticated={isAuthenticated}
        className="sticky top-0 z-50"
        onChatClick={toggleChat}
      />

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-background via-muted/50 to-background">
        <Routes>
          <Route path="/*" element={<LandingPage />} />

          <Route path="/auth/callback" element={<OAuthCallback />} />

          <Route path="/dashboard/*" element={<Dashboard />} />

          <Route path="/workspace/*" element={<WorkSpace />} />

          <Route path="/space/*" element={<SpacePage/>} />

          <Route path="/board/:boardId/*" element={<BoardPage />} />

          <Route path="/chat" element={<ChatPage />} />

          <Route path="/support" element={<SupportPage />} />

          <Route path="/no-access" element={<NoAccessPage />} />

          <Route path="*" element={
            <Navigate to="/" replace />
          } />
        </Routes>
      </main>

      {/* Floating Chat Button */}
      {isAuthenticated && (
        <div className="fixed bottom-6 right-6 z-50">
          {!isChatOpen ? (
            <button
              onClick={toggleChat}
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center"
              title="Customer Support Chat"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={toggleChat}
              className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center"
              title="Close Chat"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

      {/* Chat Widget */}
      <ChatWidget 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={logout}
        userName={user?.user?.name || 'User'}
      />
      
      {/* Socket Debugger - Remove this in production */}
      {process.env.NODE_ENV === 'development' && <SocketDebugger />}
      
      {/* Socket Connection Test - Remove this in production */}
      {process.env.NODE_ENV === 'development' && <SocketConnectionTest />}
    </AppLayout>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider 
        defaultTheme="dark" 
        storageKey="theme"      >
        <AccessibilityProvider>
          <Router>
            <SocketProvider>
              <AppContent />
            </SocketProvider>
          </Router>
        </AccessibilityProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
