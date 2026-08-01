import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './lib/auth.jsx';
import { StoreProvider } from './lib/store.jsx';
import { ThemeProvider } from './lib/theme.jsx';
import { ToastProvider } from './components/ui/Toast.jsx';
import ErrorBoundary from './components/layout/ErrorBoundary.jsx';
import './index.css';

/* AuthProvider sits outside StoreProvider because the store's cloud-sync side
   channel reads the signed-in user from it. ToastProvider is inside both so a
   sync failure can surface a toast. */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <StoreProvider>
            <ToastProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </ToastProvider>
          </StoreProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
