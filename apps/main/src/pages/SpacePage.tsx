import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { PageTransition, AnimatedPage, usePageTransition } from '../components/common/PageTransition';
import SpaceSidebar from '../layouts/space/Sidebar';
import { useIsDesktop } from '../hooks/media/useMediaQuery';
import { useSpaceManager } from '../hooks/useSpaceManager';
import MainPage from '../layouts/space/MainPage';
import BoardsLayout from '../layouts/space/BoardsLayout';
import SettingsLayout from '../layouts/space/SettingsLayout';
import { Loading } from '@taskflow/ui';

const SpacePage: React.FC = React.memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleAnimationStart, handleAnimationComplete } = usePageTransition();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLarge = useIsDesktop();
  
  // Get current space from Redux state
  const { 
    currentSpace, 
    spaceLoading, 
    spaceError,
    loadSpace
  } = useSpaceManager();

  // Check if we have a current space, if not redirect to workspace
  useEffect(() => {
    if (!currentSpace && !spaceLoading) {
      // No space selected, redirect to workspace to select a space
      navigate('/workspace');
    }
  }, [currentSpace, spaceLoading, navigate]);

  // Show loading while fetching space data
  if (spaceLoading) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <Loading text="Loading space..." />
      </div>
    );
  }

  // Redirect to workspace if no space is selected
  if (!currentSpace) {
    return <Navigate to="/workspace" replace />;
  }

  // Show error if space loading failed
  if (spaceError) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Space</h2>
          <p className="text-muted-foreground mb-4">{spaceError}</p>
          <button 
            onClick={() => currentSpace && loadSpace(currentSpace._id)}
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
        <SpaceSidebar 
          locationPath={location.pathname}
          locationHash={location.hash}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          currentSpace={currentSpace}
        />
      )}
      
      {/* Mobile Sidebar - Always rendered for mobile toggle button */}
      {!isLarge && (
        <SpaceSidebar 
          locationPath={location.pathname}
          locationHash={location.hash}
          mobile
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          currentSpace={currentSpace}
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
                  <MainPage currentSpace={currentSpace} />
                </AnimatedPage>
              } />
              
              <Route path="boards" element={
                <AnimatedPage 
                  animationType="fade"
                  onAnimationStart={handleAnimationStart}
                  onAnimationComplete={handleAnimationComplete}
                >
                  <BoardsLayout currentSpace={currentSpace} />
                </AnimatedPage>
              } />

              <Route path="settings" element={
                <AnimatedPage 
                  animationType="fade"
                  onAnimationStart={handleAnimationStart}
                  onAnimationComplete={handleAnimationComplete}
                >
                  <SettingsLayout currentSpace={currentSpace} />
                </AnimatedPage>
              } />

              {/* Placeholder routes for future features */}
              <Route path="analytics" element={
                <AnimatedPage 
                  animationType="fade"
                  onAnimationStart={handleAnimationStart}
                  onAnimationComplete={handleAnimationComplete}
                >
                  <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-xl font-semibold text-foreground mb-2">Analytics</h2>
                      <p className="text-muted-foreground">Space analytics coming soon...</p>
                    </div>
                  </div>
                </AnimatedPage>
              } />
            </Routes>
          </PageTransition>
        </main>
      </div>
    </div>
  );
});

SpacePage.displayName = 'SpacePage';

export default SpacePage;
