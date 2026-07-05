import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AppShell from './AppShell';
import './styles/globals.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const isGoogleEnabled = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'your_google_client_id_here';

const Root = isGoogleEnabled ? (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <AppShell />
  </GoogleOAuthProvider>
) : (
  <AppShell />
);

ReactDOM.createRoot(document.getElementById('root')).render(Root);
