import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const HomePage     = lazy(() => import('./pages/HomePage'));
const LoginPage    = lazy(() => import('./pages/LoginPage'));
const UploadPage   = lazy(() => import('./pages/UploadPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <Routes>
          <Route path="/"             element={<HomePage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/admin/upload" element={<UploadPage />} />
          <Route path="/admin"        element={<DashboardPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}