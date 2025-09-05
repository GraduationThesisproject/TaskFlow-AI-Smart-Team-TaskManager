import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { PageTransition, AnimatedPage, usePageTransition } from '../components/common/PageTransition';
import { SideBarDashboard } from '../layouts/Dashboard/SideBarDashboard';
import { useIsDesktop } from '../hooks/media/useMediaQuery';
import Home from '../layouts/Dashboard/Home.Layouts';
import Templates from '../layouts/Dashboard/Templates.Layouts';
import Settings from '../layouts/Dashboard/Settings.Layouts';
import UserAnalyticsLayout from '../layouts/Dashboard/UserAnalytics.Layout';
import WorkspacesLayout from '../layouts/Dashboard/Workspaces.Layouts';

const Dashboard: React.FC = React.memo(() => {
  const location = useLocation();
  const { handleAnimationStart, handleAnimationComplete } = usePageTransition();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLarge = useIsDesktop();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {isLarge && (
        <SideBarDashboard
          locationPath={location.pathname}
          locationHash={location.hash}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
      )}
      
      {/* Mobile Sidebar - Always rendered for mobile toggle button */}
      {!isLarge && (
        <SideBarDashboard
          locationPath={location.pathname}
          locationHash={location.hash}
          mobile
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
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
                  <Home/>
                </AnimatedPage>
              } />
              <Route path="/settings" element={
                <AnimatedPage 
                  animationType="fade"
                  onAnimationStart={handleAnimationStart}
                  onAnimationComplete={handleAnimationComplete}
                >
                  <Settings/>
                </AnimatedPage>
              } />
              <Route path="/settings/profile" element={
                <AnimatedPage 
                  animationType="fade"
                  onAnimationStart={handleAnimationStart}
                  onAnimationComplete={handleAnimationComplete}
                >
                  <Settings/>
                </AnimatedPage>
              } />
              <Route path="/settings/theme" element={
                <AnimatedPage 
                  animationType="fade"
                  onAnimationStart={handleAnimationStart}
                  onAnimationComplete={handleAnimationComplete}
                >
                  <Settings/>
                </AnimatedPage>
              } />
              <Route path="/settings/notifications" element={
                <AnimatedPage 
                  animationType="fade"
                  onAnimationStart={handleAnimationStart}
                  onAnimationComplete={handleAnimationComplete}
                >
                  <Settings/>
                </AnimatedPage>
              } />
              <Route path="/settings/upgrade" element={
                <AnimatedPage 
                  animationType="fade"
                  onAnimationStart={handleAnimationStart}
                  onAnimationComplete={handleAnimationComplete}
                >
                  <Settings/>
                </AnimatedPage>
              } />
              <Route path="/settings/activity" element={
                <AnimatedPage 
                  animationType="fade"
                  onAnimationStart={handleAnimationStart}
                  onAnimationComplete={handleAnimationComplete}
                >
                  <Settings/>
                </AnimatedPage>
              } />
              <Route path="/home" element={
                <AnimatedPage 
                  animationType="fade"
                  onAnimationStart={handleAnimationStart}
                  onAnimationComplete={handleAnimationComplete}
                >
                  <Home/>
                </AnimatedPage>
              } />
              <Route path="/workspaces" element={
                <AnimatedPage 
                  animationType="scale"
                  onAnimationStart={handleAnimationStart}
                  onAnimationComplete={handleAnimationComplete}
                >
                  <WorkspacesLayout/>
                </AnimatedPage>
              } />
              <Route path="/templates" element={
                <AnimatedPage 
                  animationType="scale"
                  onAnimationStart={handleAnimationStart}
                  onAnimationComplete={handleAnimationComplete}
                >
                  <Templates/>
                </AnimatedPage>
              } />
              <Route path="/analytics" element={
                <AnimatedPage 
                  animationType="fade"
                  onAnimationStart={handleAnimationStart}
                  onAnimationComplete={handleAnimationComplete}
                >
                  <UserAnalyticsLayout/>
                </AnimatedPage>
              } />
            </Routes>
          </PageTransition>
        </main>
      </div>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
