import { Button,  Typography, Flex } from '@taskflow/ui';
import { Link } from 'react-router-dom';
import { ThemeProvider } from '@taskflow/theme';
import { useTheme } from './hooks/useTheme';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAuth } from './hooks/useAuth';

import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import { SpacePage } from './pages/space.page';
import { BoardPage } from './pages/board.page';
import { DragDropTestPage } from './pages/dragDropTest.page';
import TaskDetailDemo from './pages/taskDetailDemo.page';
import { TaskManagementExample } from './components/board/TaskManagementExample';
import { ApiTestPage } from './pages/apiTest.page';

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      {/* Header with Theme Toggle */}
      <header className="backdrop-blur-sm bg-card/90 border-b border-border/30 w-full sticky top-0 z-50 shadow-sm">
        <div className="w-full px-6 sm:px-8 lg:px-12 py-6">
          <Flex justify="between" align="center">
            <div className="flex items-center gap-3">
              <Link to="/space/space1" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <Typography variant="heading-large" className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  TaskFlow AI
                </Typography>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/api-test">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-muted/50 transition-all duration-200"
                >
                  🔌 API Test
                </Button>
              </Link>
              <Link to="/drag-drop-test">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-muted/50 transition-all duration-200"
                >
                  🧪 Test Drag & Drop
                </Button>
              </Link>
              <Link to="/task-detail-demo">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-muted/50 transition-all duration-200"
                >
                  📋 Task Detail Demo
                </Button>
              </Link>
              <Link to="/task-management">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-muted/50 transition-all duration-200"
                >
                  🚀 Task Management
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="flex items-center gap-2 hover:bg-muted/50 transition-all duration-200 rounded-full px-4 py-2"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
                <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </Button>
            </div>
          </Flex>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 pointer-events-none"></div>
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Navigate to="/task-management" replace />} />
            <Route path="/api-test" element={<ApiTestPage />} />
            <Route path="/space/*" element={<SpacePage />} />
            <Route path="/board/*" element={<BoardPage />} />
            <Route path="/drag-drop-test" element={<DragDropTestPage />} />
            <Route path="/task-detail-demo" element={<TaskDetailDemo />} />
            <Route path="/task-management" element={<TaskManagementExample />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
