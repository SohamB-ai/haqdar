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
import { useUser, useAuth } from '@clerk/react';
import ChatBot from './components/ChatBot';

function App() {
  const [view, setView] = useState('landing');
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const [prevIsSignedIn, setPrevIsSignedIn] = useState(false);
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('haqdar_user_data');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (userData) {
      localStorage.setItem('haqdar_user_data', JSON.stringify(userData));
    } else {
      localStorage.removeItem('haqdar_user_data');
    }
  }, [userData]);

  useEffect(() => {
    // Redirect to input if user just signed in or is on auth pages while signed in
    if (isLoaded) {
      if (isSignedIn) {
        if (view === 'signin' || view === 'signup' || (!prevIsSignedIn && view === 'landing')) {
          setView(userData ? 'dashboard' : 'input');
        }
      } else {
        if (view === 'dashboard' || view === 'input' || view === 'transition') {
          setView('landing');
        }
      }
      setPrevIsSignedIn(isSignedIn);
    }
  }, [isLoaded, isSignedIn, view, prevIsSignedIn]);

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
        return <AuthPages type="signin" onSwitch={setView} onFinish={() => setView('dashboard')} />;
      case 'signup':
        return <AuthPages type="signup" onSwitch={setView} onFinish={() => setView('input')} />;
      case 'input':
        return <InputPanel 
          onHome={() => setView('landing')}
          onComplete={(data) => {
            console.log('Form completed:', data);
            setUserData(data);
            setView('transition');
          }} 
        />;
      case 'transition':
        return <TransitionPage onHome={() => setView('landing')} onNavigate={handleNavigate} />;
      case 'dashboard':
        return <Dashboard 
          onHome={() => setView('landing')} 
          userData={userData} 
          googleUser={user} 
          onLogout={() => {
            signOut();
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
      <ChatBot />
    </div>
  );
}

const styles = {
  app: {
    backgroundColor: '#020617',
    color: '#F8FAFC',
    minHeight: '100vh',
  },
  footer: {
    padding: '4rem 2rem',
    textAlign: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    color: '#64748B',
  }
};

export default App;
