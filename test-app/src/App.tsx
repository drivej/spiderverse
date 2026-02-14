import { Link, Outlet, useLocation } from 'react-router-dom';
import './App.css';

function App() {
  const location = useLocation();

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{
        padding: '1rem 2rem',
        backgroundColor: '#1a1a1a',
        borderBottom: '2px solid #333',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <Link
          to="/"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: location.pathname === '/' ? '#2563eb' : '#374151',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            transition: 'background-color 0.2s'
          }}
        >
          Home
        </Link>
        <Link
          to="/component"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: location.pathname === '/wave' ? '#2563eb' : '#374151',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            transition: 'background-color 0.2s'
          }}
        >
          Component
        </Link>
        <span style={{ marginLeft: 'auto', color: '#888', fontSize: '0.9rem' }}>
          Current Route: {location.pathname}
        </span>
      </nav>

      {/* Page Content */}
      <Outlet />
    </div>
  );
}

export default App;
