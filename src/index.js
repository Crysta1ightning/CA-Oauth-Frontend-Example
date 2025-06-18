import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import AuthCallback from './pages/AuthCallback.tsx'; // 🔁 確保這個檔案存在
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/api/oauth/proxy" element={<AuthCallback />} /> {/* 🔥 新增這行 */}
    </Routes>
  </BrowserRouter>
);

reportWebVitals();
