import { SpiderVerse } from 'my-component';

function ComponentPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '2rem', color: '#fff' }}>SpiderVerse Component</h1>
      <SpiderVerse style={{background:'#ccc', width:'100%', aspectRatio:'1/1'}}/>
    </div>
  );
}

export default ComponentPage;
