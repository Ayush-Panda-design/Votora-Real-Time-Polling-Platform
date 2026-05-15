import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import store from './store/store';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import './styles/globals.css';
import CenteredToast from './components/ui/CenteredToast';

import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const isGoogleEnabled = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'your_google_client_id_here';

const AuthProviderWrapper = isGoogleEnabled ? GoogleOAuthProvider : React.Fragment;
const authProviderProps = isGoogleEnabled ? { clientId: GOOGLE_CLIENT_ID } : {};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProviderWrapper {...authProviderProps}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ThemeProvider>
            <AuthProvider>
              <SocketProvider>
                <App />
                <Toaster
                  position="top-center"
                  containerStyle={{
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  toastOptions={{
                    duration: Infinity, 
                  }}
                >
                  {(t) => (
                    <CenteredToast 
                      t={t} 
                      message={t.message} 
                      type={t.type} 
                    />
                  )}
                </Toaster>
              </SocketProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </AuthProviderWrapper>
    </Provider>
  </React.StrictMode>
);
