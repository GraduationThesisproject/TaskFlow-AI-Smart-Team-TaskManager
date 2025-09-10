import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { PageTransition, AnimatedPage, usePageTransition } from '../components/common/PageTransition';
import Sidebar from '../layouts/workSpace/Sidebar';
import { useIsDesktop } from '../hooks/media/useMediaQuery';
import { useWorkspace } from '../hooks/useWorkspace';
import { useSpaceManager } from '../hooks/useSpaceManager';
import Main from '../layouts/workSpace/MainPage';
import SettingsLayout from '../layouts/workSpace/SettingsLayout';
import ReportsLayout from '../layouts/workSpace/ReportsLayout';
import SpacesLayout from '../layouts/workSpace/SpacesLayout';
import { Loading } from '@taskflow/ui';

const WorkSpace: React.FC = React.memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleAnimationStart, handleAnimationComplete } = usePageTransition();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLarge = useIsDesktop();
  
  // Get current workspace from Redux state
  const { 
    currentWorkspace, 
    loading: workspaceLoading, 
    error: workspaceError,
    loadWorkspaces 
  } = useWorkspace({ autoFetch: false });

  // Get space manager for handling space selection
  const { selectSpace } = useSpaceManager();

  // Load workspaces on mount if none exist
  useEffect(() => {
    if (!currentWorkspace && !workspaceLoading) {
      loadWorkspaces();
    }
  }, [currentWorkspace, workspaceLoading]); // Add workspaceLoading to prevent calling while already loading

  // Show loading while fetching workspace data
  if (workspaceLoading) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <Loading text="Loading workspace..." />
      </div>
    );
  }

  // Redirect to dashboard if no workspace is selected
  if (!currentWorkspace) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show error if workspace loading failed
  if (workspaceError) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Workspace</h2>
          <p className="text-muted-foreground mb-4">{workspaceError}</p>
          <button 
            onClick={() => loadWorkspaces()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {isLarge && (
        <Sidebar 
          locationPath={location.pathname}
          locationHash={location.hash}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          currentWorkspace={currentWorkspace}
        />
      )}
      
      {/* Mobile Sidebar - Always rendered for mobile toggle button */}
      {!isLarge && (
        <Sidebar 
          locationPath={location.pathname}
          locationHash={location.hash}
          mobile
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          currentWorkspace={currentWorkspace}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-visible p-4">
          <PageTransition location={location}>
            <Routes location={location} key={location.pathname}>
              <Route path="" element={
                <AnimatedPage 
                  animationType="fade"
                  onAnimationStart={handleAnimationStart}
                  onAnimationComplete={handleAnimationComplete}
                >
                  <Main currentWorkspace={currentWorkspace} />
                </AnimatedPage>
              } />
              
              <Route path="settings/*" element={
                <AnimatedPage 
                  animationType="fade"
                  onAnimationStart={handleAnimationStart}
                  onAnimationComplete={handleAnimationComplete}
                >
                  <SettingsLayout currentWorkspace={currentWorkspace} />
                </AnimatedPage>
              } />

              <Route path="spaces" element={
                <AnimatedPage 
                  animationType="fade"
                  onAnimationStart={handleAnimationStart}
                  onAnimationComplete={handleAnimationComplete}
                >
                  <SpacesLayout currentWorkspace={currentWorkspace} />
                </AnimatedPage>
              } />

              <Route path="reports/*" element={
                <AnimatedPage 
                  animationType="fade"
                  onAnimationStart={handleAnimationStart}
                  onAnimationComplete={handleAnimationComplete}
                >
                  <ReportsLayout currentWorkspace={currentWorkspace} />
                </AnimatedPage>
              } />
            </Routes>
          </PageTransition>
        </main>
      </div>
    </div>
  );
});

WorkSpace.displayName = 'WorkSpace';

export default WorkSpace;
