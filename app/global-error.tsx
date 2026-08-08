'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Buniyaad — something went wrong</h1>
        <p style={{ color: '#555', fontSize: '0.875rem', marginBottom: '1rem' }}>{error.message}</p>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: '0.5rem 1rem',
            background: '#b45309',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
