import { Button,  Typography, Flex, Container } from '@taskflow/ui';
import { ThemeProvider } from '@taskflow/theme';
import { useTheme } from './hooks/useTheme';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { SpacePage } from './pages/space.page';
import WorkSpace from './pages/workSpace';
import { LandingPage } from './pages/LandingPage';


function AppContent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with Theme Toggle */}
      <header className="border-b border-border bg-card">
        <Container size="7xl" className="py-4">
          <Flex justify="between" align="center">
            <Typography variant="heading-large" className="font-bold">
              TaskFlow AI
            </Typography>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="flex items-center gap-2"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </Flex>
        </Container>
      </header>

      {/* Main Content with Gradient Background */}
      <main className="bg-gradient-to-br from-background via-muted/50 to-background">
        <Routes>
          <Route path="/*" element={<LandingPage />} />
          <Route path="/space/*" element={<SpacePage />} />
          <Route path="/workspace/*" element={<WorkSpace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>

  );
}

export default App;
