import { Link, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Upload, LayoutDashboard, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { Drawer } from './Drawer';
import client from '@/api/client';

interface HeaderProps {
  onUploadClick: () => void;
}

export function Header({ onUploadClick }: HeaderProps) {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await client.post('/logout');
    } catch {
      // ignore
    }
    logout();
    showSnackbar('Logged out');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--bg-primary)]/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* 左側：漢堡 + Logo */}
        <div className="flex items-center gap-3">
          <Drawer onUploadClick={onUploadClick}>
            <button className="p-2 rounded-md hover:bg-[var(--bg-secondary)] transition-colors">
              <Menu size={20} className="text-[var(--text-secondary)]" />
            </button>
          </Drawer>
          <Link
            to="/"
            className="font-display text-lg font-semibold tracking-tight text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
          >
            Daily Meal
          </Link>
        </div>

        {/* 右側桌機導航 */}
        <nav className="hidden md:flex items-center gap-1">
          {isAuthenticated ? (
            <>
              <button
                onClick={onUploadClick}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
              >
                <Upload size={15} />
                Upload
              </button>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
              >
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
            >
              <LogIn size={15} />
              Login
            </Link>
          )}

          {/* 主題切換 */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </nav>
      </div>
    </header>
  );
}