import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { StoreProvider } from './lib/store.jsx';
import { ThemeProvider } from './lib/theme.jsx';
import { ToastProvider } from './components/ui/Toast.jsx';
import ErrorBoundary from './components/layout/ErrorBoundary.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <StoreProvider>
          <ToastProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ToastProvider>
        </StoreProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
