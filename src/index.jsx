import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { Buffer } from 'buffer';

// 1. Buffer polyfill
if (typeof window !== 'undefined') {
  window.global = window;
  window.Buffer = Buffer;
}

// 2. Modern Google Maps Loader
// IMPORTANT: Replace the string below with your actual API key starting with "AIza..."
const GOOGLE_MAPS_API_KEY = 'PASTE_YOUR_REAL_AIza_KEY_HERE'; 

const loadGoogleMaps = () => {
  if (window.google?.maps) return;

  const script = document.createElement('script');
  // We use &v=beta or &v=weekly to ensure we have access to the 2025 "New" Places features
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly&loading=async`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
};

loadGoogleMaps();

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error('React Error:', error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.toString()}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter 
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );
}