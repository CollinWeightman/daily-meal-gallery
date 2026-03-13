import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, LayoutDashboard, LogIn, LogOut, Sun, Moon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { useState } from 'react';
import client from '@/api/client';

interface DrawerProps {
  children: ReactNode;
  onUploadClick: () => void;
}

export function Drawer({ children, onUploadClick }: DrawerProps) {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleLogout = async () => {
    try {
      await client.post('/logout');
    } catch {
      // ignore
    }
    logout();
    showSnackbar('Logged out');
    close();
    navigate('/');
  };

  const handleUpload = () => {
    close();
    onUploadClick();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent
            side="left"
            aria-describedby={undefined}
            className="w-64 bg-[var(--bg-primary)] border-r border-[var(--border)]"
        >
            <SheetHeader className="mb-6">
            <SheetTitle className="font-display text-left text-[var(--text-primary)]">
                Daily Meal
            </SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col gap-1">
            {isAuthenticated ? (
                <>
                <button
                    onClick={handleUpload}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors text-left"
                >
                    <Upload size={16} />
                    Upload
                </button>
                <Link
                    to="/dashboard"
                    onClick={close}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
                >
                    <LayoutDashboard size={16} />
                    Dashboard
                </Link>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors text-left"
                >
                    <LogOut size={16} />
                    Logout
                </button>
                </>
            ) : (
                <Link
                to="/login"
                onClick={close}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
                >
                <LogIn size={16} />
                Login
                </Link>
            )}

            {/* 分隔線 + 主題切換 */}
            <div className="border-t border-[var(--border)] mt-3 pt-3">
                <button
                onClick={toggleTheme}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors w-full text-left"
                >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
            </div>
            </nav>
        </SheetContent>
    </Sheet>
  );
}