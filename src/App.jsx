import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import axios from 'axios';
import { useUser, useAuth } from '@clerk/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProblemSolution from './components/ProblemSolution';
import { HowItWorks, TechStack } from './components/Sections';
import AuthPages from './components/AuthPages';
import InputPanel from './components/InputPanel';
import Dashboard from './components/Dashboard';
import TransitionPage from './components/TransitionPage';
import ScrollCheckpoints from './components/ScrollCheckpoints';
import ChatBot from './components/ChatBot';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://haqdar-backend-rdno.onrender.com' : 'http://localhost:5001');

function App({ authEnabled }) {
  const [skipAuth, setSkipAuth] = useState(false);

  if (!authEnabled || skipAuth) {
    return <GuestApp onEnableAuth={() => setSkipAuth(false)} />;
  }

  return <ClerkApp onSkip={() => setSkipAuth(true)} />;
}

function usePersistentUserData() {
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

  return [userData, setUserData];
}

function useLenisScroll() {
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
}

function GuestApp({ onEnableAuth }) {
  const [view, setView] = useState('landing');
  const [userData, setUserData] = usePersistentUserData();

  useLenisScroll();

  const handleNavigate = (newView) => {
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const guestUser = {
    firstName: 'Guest',
    fullName: 'Guest User',
    primaryEmailAddress: { emailAddress: 'guest@haqdar.local' },
  };

  return (
    <AppShell
      authEnabled={false}
      view={view}
      setView={setView}
      handleNavigate={handleNavigate}
      userData={userData}
      setUserData={setUserData}
      googleUser={guestUser}
      getToken={async () => 'dev-token'}
      onLogout={() => {
        setUserData(null);
        setView('landing');
        if (onEnableAuth) onEnableAuth();
      }}
    />
  );
}

function ClerkApp({ onSkip }) {
  const [view, setView] = useState('landing');
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut, getToken } = useAuth();
  const [prevIsSignedIn, setPrevIsSignedIn] = useState(false);
  const [userData, setUserData] = usePersistentUserData();
  const [dbUserLoaded, setDbUserLoaded] = useState(false);

  useLenisScroll();

  useEffect(() => {
    const fetchUserFromDB = async () => {
      if (!isSignedIn || !user || dbUserLoaded) return;
      try {
        const token = await getToken();
        const res = await axios.get(`${API_URL}/api/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.user && res.data.user.onboardingComplete) {
          setUserData({
            homeState: res.data.user.homeState,
            currentState: res.data.user.currentState,
            gender: res.data.user.gender,
            age: res.data.user.age,
            occupation: res.data.user.occupation,
            income: res.data.user.income,
            category: res.data.user.category,
            familySize: res.data.user.familySize,
            earningMembers: res.data.user.earningMembers,
            docs: res.data.user.documents || [],
          });
        }
      } catch (err) {
        console.log('User not in DB yet, will create after onboarding.');
      } finally {
        setDbUserLoaded(true);
      }
    };
    fetchUserFromDB();
  }, [dbUserLoaded, getToken, isSignedIn, setUserData, user]);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        if (view === 'signin' || view === 'signup' || (!prevIsSignedIn && view === 'landing')) {
          setView(userData ? 'dashboard' : 'input');
        }
      } else if (view === 'dashboard' || view === 'input' || view === 'transition') {
        setView('landing');
      }
      setPrevIsSignedIn(isSignedIn);
    }
  }, [isLoaded, isSignedIn, prevIsSignedIn, userData, view]);

  const saveUserToDB = async (formData) => {
    if (!user) return;
    try {
      const token = await getToken();
      await axios.post(`${API_URL}/api/user`, {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        fullName: user.fullName,
        imageUrl: user.imageUrl,
        homeState: formData.homeState,
        currentState: formData.currentState,
        gender: formData.gender,
        age: formData.age,
        occupation: formData.occupation,
        income: formData.income,
        category: formData.category,
        familySize: formData.familySize,
        earningMembers: formData.earningMembers,
        documents: formData.docs || [],
        onboardingComplete: true,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to save user to DB:', err);
    }
  };

  const handleNavigate = (newView) => {
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppShell
      authEnabled
      view={view}
      setView={setView}
      handleNavigate={handleNavigate}
      userData={userData}
      setUserData={setUserData}
      googleUser={user}
      getToken={getToken}
      onSaveUserData={saveUserToDB}
      onSkip={onSkip}
      onLogout={() => {
        signOut();
        setUserData(null);
        setDbUserLoaded(false);
        setView('landing');
      }}
    />
  );
}

function AppShell({
  authEnabled,
  view,
  setView,
  handleNavigate,
  userData,
  setUserData,
  googleUser,
  getToken,
  onLogout,
  onSaveUserData,
  onSkip
}) {
  const isSignedIn = authEnabled ? Boolean(googleUser) : true;

  const completeInput = (data) => {
    setUserData(data);
    if (onSaveUserData) {
      onSaveUserData(data);
    }
    setView('transition');
  };

  const renderView = () => {
    switch (view) {
      case 'landing':
      case 'home':
        return (
          <>
            <Hero onGetStarted={() => setView(authEnabled ? 'signup' : 'input')} />
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
        return <AuthPages type="signin" onSwitch={setView} authEnabled={authEnabled} onSkip={onSkip} />;
      case 'signup':
        return <AuthPages type="signup" onSwitch={setView} authEnabled={authEnabled} onSkip={onSkip} />;
      case 'input':
        return (
          <InputPanel
            onHome={() => setView('landing')}
            onComplete={completeInput}
          />
        );
      case 'transition':
        return <TransitionPage onHome={() => setView('landing')} onNavigate={handleNavigate} userData={userData} />;
      case 'dashboard':
        return (
          <Dashboard
            authEnabled={authEnabled}
            onHome={() => setView('landing')}
            userData={userData}
            googleUser={googleUser}
            getToken={getToken}
            onLogout={onLogout}
          />
        );
      default:
        return <div>404 Page Not Found</div>;
    }
  };

  return (
    <div style={styles.app}>
      {!authEnabled && <div style={styles.guestBanner}>Guest mode active. Add `VITE_CLERK_PUBLISHABLE_KEY` to enable sign-in.</div>}
      {view !== 'input' && view !== 'transition' && (
        <Navbar
          authEnabled={authEnabled}
          isSignedIn={isSignedIn}
          onNavigate={handleNavigate}
          currentView={view}
          onSkip={onSkip}
        />
      )}
      {renderView()}
      <ChatBot authEnabled={authEnabled} getToken={getToken} />
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
  },
  guestBanner: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1100,
    padding: '0.65rem 1rem',
    textAlign: 'center',
    background: 'rgba(245, 158, 11, 0.14)',
    borderBottom: '1px solid rgba(245, 158, 11, 0.35)',
    color: '#FDE68A',
    fontSize: '0.85rem',
  },
};

export default App;
