export default function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>User Management &amp; Preferences</h1>
      <p>Frontend placeholder — monorepo infra verified.</p>
      <p>
        API base:{' '}
        <code>{import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}</code>
      </p>
    </div>
  );
}
