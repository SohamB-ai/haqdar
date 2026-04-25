import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProblemSolution from './components/ProblemSolution';
import { HowItWorks, TechStack } from './components/Sections';
import AuthPages from './components/AuthPages';
import InputPanel from './components/InputPanel';
import Dashboard from './components/Dashboard';

function App() {
  const [view, setView] = useState('landing');

  const handleNavigate = (newView) => {
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    switch (view) {
      case 'landing':
      case 'home':
        return (
          <>
            <Hero onGetStarted={() => setView('signup')} />
            <ProblemSolution />
            <HowItWorks />
            <TechStack />
            <footer style={styles.footer}>
              <p>© 2026 HaqDaar. Empowering every citizen.</p>
            </footer>
          </>
        );
      case 'signin':
        return <AuthPages type="signin" onSwitch={setView} onFinish={() => setView('landing')} />;
      case 'signup':
        return <AuthPages type="signup" onSwitch={setView} onFinish={() => setView('input')} />;
      case 'input':
        return <InputPanel onComplete={(data) => {
          console.log('Form completed:', data);
          setView('dashboard');
        }} />;
      case 'dashboard':
        return <Dashboard />;
      default:
        return <div>404 Page Not Found</div>;
    }
  };

  return (
    <div style={styles.app}>
      {(view === 'landing' || view === 'home') && <Navbar onNavigate={handleNavigate} />}
      {renderView()}
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  footer: {
    padding: '4rem',
    textAlign: 'center',
    borderTop: '1px solid rgba(64, 224, 208, 0.1)',
    color: '#A1A1AA',
  },
  dashboard: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2rem',
  },
};

export default App;
