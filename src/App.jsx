import { useState, useEffect } from 'react'
import { Layout } from './components/Layout'
import LogDrill from './views/LogDrill'
import Weekly from './views/Weekly'
import History from './views/History'
import Profile from './views/Profile'
import Leaderboard from './views/Leaderboard'
import { SplashScreen } from './components/SplashScreen'
import { Onboarding } from './components/Onboarding'
import { Auth } from './components/Auth'
import { UserProvider, useUser } from './context/UserContext'
import { DrillsProvider } from './context/DrillsContext'
import { GamificationProvider } from './context/GamificationContext'
import { Activity, Calendar, History as HistoryIcon, User, Trophy } from 'lucide-react'

function AppContent() {
  const { user, loading } = useUser();
  const [activeTab, setActiveTab] = useState('log');

  if (loading) return <div className="min-h-screen bg-bg-body flex items-center justify-center text-primary">Loading...</div>;

  if (!user) {
    return <Auth />;
  }

  // If user is logged in but profile failed to load (likely SQL issue)
  if (!loading && !user.profile && !useUser().profile) {
    return (
      <div className="min-h-screen bg-bg-body flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-xl font-bold text-red-400">Setup Required</h2>
          <p className="text-text-muted">
            We couldn't load your profile. This usually means the database tables haven't been created yet.
          </p>
          <p className="text-sm text-text-muted/80">
            Please run the SQL script in your Supabase Dashboard (see walkthrough.md).
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-bg-body font-bold rounded-xl"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeTab) {
      case 'log': return <LogDrill />;
      case 'history': return <History />;
      case 'weekly': return <Weekly />;
      case 'leaderboard': return <Leaderboard />;
      case 'profile': return <Profile />;
      default: return <LogDrill />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderView()}
    </Layout>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('hasOnboarded');
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleOnboardingFinish = () => {
    localStorage.setItem('hasOnboarded', 'true');
    setShowOnboarding(false);
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  if (showOnboarding) {
    return <Onboarding onFinish={handleOnboardingFinish} />;
  }

  return (
    <UserProvider>
      <DrillsProvider>
        <GamificationProvider>
          <AppContent />
        </GamificationProvider>
      </DrillsProvider>
    </UserProvider>
  );
}

export default App;
