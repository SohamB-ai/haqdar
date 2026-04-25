import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProblemSolution from './components/ProblemSolution';
import { HowItWorks, TechStack } from './components/Sections';
import AuthPages from './components/AuthPages';
import InputPanel from './components/InputPanel';
import Dashboard from './components/Dashboard';
import TransitionPage from './components/TransitionPage';
import ScrollCheckpoints from './components/ScrollCheckpoints';

function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

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
            <ScrollCheckpoints />
            <ProblemSolution />
            <HowItWorks />
            <TechStack />
            <footer style={styles.footer}>
              <p>© 2026 HaqDaar. Empowering every citizen.</p>
            </footer>
          </>
        );
      case 'signin':
        return <AuthPages type="signin" onSwitch={setView} onFinish={(u) => {
          setUser(u);
          setView('dashboard');
        }} />;
      case 'signup':
        return <AuthPages type="signup" onSwitch={setView} onFinish={(u) => {
          setUser(u);
          setView('input');
        }} />;
      case 'input':
      case 'input':
        return <InputPanel 
          onComplete={(data) => {
            setUserData(data);
            setView('transition');
          }} 
        />;
      case 'transition':
        return <TransitionPage onHome={() => setView('landing')} onNavigate={handleNavigate} />;
      case 'dashboard':
        return <Dashboard 
          googleUser={user} 
          userData={userData} 
          onLogout={() => {
            setUser(null);
            setUserData(null);
            setView('landing');
          }} 
        />;
      default:
        return <div>404 Page Not Found</div>;
    }
  };

  return (
    <div style={styles.app}>
      {view !== 'input' && view !== 'transition' && <Navbar onNavigate={handleNavigate} currentView={view} isDashboard={view === 'dashboard'} />}
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
    borderTop: '1px solid rgba(34, 211, 238, 0.2)',
    color: 'var(--text-secondary)',
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
