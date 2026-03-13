import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SnackbarProvider } from '@/contexts/SnackbarContext';
import { Header } from '@/components/layout/Header';
import { UploadDialog } from '@/components/upload/UploadDialog';

const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));

// Route Guard：需登入
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

// Route Guard：已登入不能進 /login
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function AppLayout() {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header onUploadClick={() => setUploadOpen(true)} />
      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={() => {
          setUploadOpen(false);
        }}
      />
      <main>
        <Suspense fallback={
          <div className="flex items-center justify-center h-64 text-[var(--text-muted)]">
            Loading…
          </div>
        }>
          <Routes>
            <Route path="/" element={<HomePage uploadOpen={uploadOpen} setUploadOpen={setUploadOpen} />} />
            <Route path="/login" element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SnackbarProvider>
            <AppLayout />
          </SnackbarProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}