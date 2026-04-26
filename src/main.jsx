import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from "@clerk/react";
import './i18n';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const authEnabled = Boolean(PUBLISHABLE_KEY);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {authEnabled ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App authEnabled />
      </ClerkProvider>
    ) : (
      <App authEnabled={false} />
    )}
  </StrictMode>,
)
