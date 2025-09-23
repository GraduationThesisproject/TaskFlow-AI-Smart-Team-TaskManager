import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { useAppDispatch } from "./store";
import { checkAuthStatus } from "./store/slices/authSlice";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import WorkSpace from "./pages/workSpace";
import SpacePage from "./pages/SpacePage";
import { BoardPage } from "./pages/board.page";
import LandingPage  from "./pages/LandingPage";
import OAuthCallback from "./components/auth/OAuthCallback";
import GitHubPopupCallback from "./components/auth/GitHubPopupCallback";
import { LogoutConfirmDialog, AppLayout } from "./components";
import { ProtectedRoute, PublicOnlyRoute } from "./components/common";
import UniversalNavbar from "./components/common/navbar/UniversalNavbar";
import Dashboard from "./pages/Dashboard";
import InviteLanding from "./pages/InviteLanding";
import JoinWorkspace from "./pages/JoinWorkspace";
import { NoAccessPage } from "./pages/NoAccessPage";
import ChatPage from "./pages/ChatPage";
import NotificationsPage from "./pages/NotificationsPage";
import ChatWidget from "./components/chat/ChatWidget";
import { MessageCircle, X } from "lucide-react";
import Cancel from "./layouts/workSpace/Cancel";
import Success from "./layouts/workSpace/Success";
import { Loading } from "@taskflow/ui";
import { ToastProvider } from "./hooks/useToast";
import { SignInModal } from "./components/auth/SignInModal";
import { SignUpModal } from "./components/auth/SignUpModal";



function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Modal state
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
        <Loading text="Initializing..." />
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

  // Modal handlers with smooth transitions
  const handleSignInClick = () => {
    setIsSignInModalOpen(true);
  };

  const handleSignUpClick = () => {
    setIsSignUpModalOpen(true);
  };

  const handleCloseSignInModal = () => {
    setIsSignInModalOpen(false);
  };

  const handleCloseSignUpModal = () => {
    setIsSignUpModalOpen(false);
  };

  const handleSwitchToSignUp = () => {
    setIsSignInModalOpen(false);
    setIsSignUpModalOpen(true);
  };

  const handleSwitchToSignIn = () => {
    setIsSignUpModalOpen(false);
    setIsSignInModalOpen(true);
  };

  return (
      <AppLayout>
        {/* Universal Navbar - hidden on auth pages (signin/signup) */}
          <UniversalNavbar
            user={user || undefined}
            onLogout={handleLogout}
            className="sticky top-0 z-50"
            onChatClick={toggleChat}
            onSignInClick={handleSignInClick}
            onSignUpClick={handleSignUpClick}
          />

        {/* Main Content */}
        <main className="flex-1 bg-gradient-to-br from-background via-muted/50 to-background">
          <Routes>
            {/* Public Routes - Only accessible to unauthenticated users */}
            <Route 
              path="/*" 
              element={
                <PublicOnlyRoute redirectTo="/dashboard">
                  <LandingPage 
                    onSignUpClick={handleSignUpClick}
                  />
                </PublicOnlyRoute>
              } 
            />
          
          <Route 
            path="/auth/callback" 
            element={<OAuthCallback />}
          />
          
          <Route 
            path="/auth/github-popup-callback" 
            element={<GitHubPopupCallback />}
          />
          
          <Route 
            path="/invite/:token" 
            element={
              <PublicOnlyRoute redirectTo="/dashboard">
                <InviteLanding />
              </PublicOnlyRoute>
            } 
          />
          
          <Route 
            path="/join-workspace/*" 
            element={<JoinWorkspace />}
          />
          
          <Route 
            path="/cancel" 
            element={
              <PublicOnlyRoute redirectTo="/dashboard">
                <Cancel />
              </PublicOnlyRoute>
            } 
          />
          
          <Route 
            path="/success" 
            element={
              <PublicOnlyRoute redirectTo="/dashboard">
                <Success />
              </PublicOnlyRoute>
            } 
          />
          
          <Route 
            path="/no-access" 
            element={
              <PublicOnlyRoute redirectTo="/dashboard">
                <NoAccessPage />
              </PublicOnlyRoute>
            } 
          />

          {/* Protected Routes - Only accessible to authenticated users */}
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/workspace/*" 
            element={
              <ProtectedRoute>
                <WorkSpace />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/space/*" 
            element={
              <ProtectedRoute>
                <SpacePage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/board/*" 
            element={
              <ProtectedRoute>
                <BoardPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } 
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Floating Chat Button */}
      {isAuthenticated && (
        <div className="fixed bottom-6 right-6 z-50">
          {!isChatOpen ? (
            <button
              onClick={toggleChat}
              className="bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center"
              title="Customer Support Chat"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={toggleChat}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center"
              title="Close Chat"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

      {/* Chat Widget */}
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      {isAuthenticated && (
      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={(allDevices?: boolean) => logout({ allDevices })}
        userName={user?.user?.name || "User"}
      />
      )}

      {/* Auth Modals */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={handleCloseSignInModal}
        onSwitchToSignUp={handleSwitchToSignUp}
      />
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={handleCloseSignUpModal}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
      </AppLayout>
  );
}


export default App;
