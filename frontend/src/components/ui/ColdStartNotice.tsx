interface ColdStartNoticeProps {
  variant?: 'waking' | 'unavailable';
  onRetry?: () => void;
}

export default function ColdStartNotice({ variant = 'waking', onRetry }: ColdStartNoticeProps) {
  if (variant === 'unavailable') {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 text-center">
              <div className="text-5xl">🛠️</div>
              <div>
                  <h2 className="text-xl font-semibold mb-2">Database temporarily unavailable</h2>
                  <p className="text-sm text-[var(--text-muted)] max-w-xs">
                      The database appears to be paused and needs to be manually restored.
                      Please check back in a few minutes.
                  </p>
              </div>
              {onRetry && (
                  <button
                      onClick={onRetry}
                      className="text-sm px-4 py-2 rounded-md border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors"
                  >
                      Try again
                  </button>
              )}
          </div>
      );
  }

  return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 text-center">
          <div className="text-5xl">☕</div>
          <div>
              <h2 className="text-xl font-semibold mb-2">Waking up the server...</h2>
              <p className="text-sm text-[var(--text-muted)] max-w-xs">
                  The backend is hosted on a free tier and sleeps when idle.
                  First load usually takes 30–60 seconds — thanks for your patience!
              </p>
          </div>
          <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                  <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                  />
              ))}
          </div>
      </div>
  );
}