import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

type SnackbarType = 'success' | 'error' | 'info';

interface SnackbarMessage {
  id: number;
  message: string;
  type: SnackbarType;
}

interface SnackbarContextType {
  showSnackbar: (message: string, type?: SnackbarType) => void;
}

const SnackbarContext = createContext<SnackbarContextType | null>(null);

let idCounter = 0;

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<SnackbarMessage[]>([]);

  const showSnackbar = useCallback((message: string, type: SnackbarType = 'success') => {
    const id = ++idCounter;
    setMessages(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== id));
    }, 3000);
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      {/* Snackbar 容器 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
        {messages.map(m => (
          <div
            key={m.id}
            className={[
              'px-5 py-3 rounded-lg text-sm font-medium shadow-lg pointer-events-auto',
              'animate-in fade-in slide-in-from-bottom-2 duration-300',
              m.type === 'success' && 'bg-[var(--text-primary)] text-[var(--bg-primary)]',
              m.type === 'error'   && 'bg-destructive text-white',
              m.type === 'info'    && 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border)]',
            ].filter(Boolean).join(' ')}
          >
            {m.message}
          </div>
        ))}
      </div>
    </SnackbarContext.Provider>
  );
}

export const useSnackbar = () => {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
  return ctx;
};