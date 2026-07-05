import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import store from './store/store';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';

const AppShell = () => (
  <Provider store={store}>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <SocketProvider>
          <App />
          <Toaster
            position="top-center"
            containerStyle={{ top: 24, left: 0, right: 0 }}
            gutter={16}
            toastOptions={{
              style: {
                background: 'transparent',
                boxShadow: 'none',
                padding: 0,
                maxWidth: '100%',
              },
            }}
          />
        </SocketProvider>
      </ThemeProvider>
    </BrowserRouter>
  </Provider>
);

export default AppShell;
