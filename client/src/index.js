import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './context/store';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
          success: { style: { background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' } },
          error:   { style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' } },
        }}
      />
    </Provider>
  </React.StrictMode>
);
