function HomePage() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      gap: '2rem'
    }}>
      <h1 style={{ color: '#fff', fontSize: '3rem' }}>Home Page</h1>
      <p style={{ color: '#aaa', fontSize: '1.2rem' }}>
        This page has no wave component mounted.
      </p>
      <p style={{ color: '#888', fontSize: '1rem', maxWidth: '600px', textAlign: 'center' }}>
        Navigate to the Wave Player page to mount the component, then come back here to test unmounting and cleanup.
      </p>
    </div>
  );
}

export default HomePage;

