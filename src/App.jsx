
// src/App.jsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import RPMAvatar from './components/RPMAvatar';

export default function App() {
  const [mouthOpenValue, setMouthOpenValue] = React.useState(0);
  const [isAutoAnimating, setIsAutoAnimating] = React.useState(false);
  const animationFrameRef = React.useRef(null);

  React.useEffect(() => {
    if (isAutoAnimating) {
      let startTime = performance.now();
      
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const value = Math.abs(Math.sin(elapsed * 0.01)) * 0.3;
        setMouthOpenValue(value);
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAutoAnimating]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <Suspense fallback={null}>
          <Environment preset="studio" />
          <RPMAvatar mouthOpenValue={mouthOpenValue} />
          <OrbitControls
            minDistance={2}
            maxDistance={5}
            enableDamping
            dampingFactor={0.05}
          />
          <ambientLight intensity={0.6} />
          <directionalLight position={[0, 5, 5]} intensity={0.8} />
        </Suspense>
      </Canvas>

      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          Ouverture de la bouche:
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={mouthOpenValue}
            onChange={(e) => {
              setIsAutoAnimating(false);
              setMouthOpenValue(parseFloat(e.target.value));
            }}
            style={{ width: '200px' }}
          />
          <span>{mouthOpenValue.toFixed(2)}</span>
        </label>
        
        <button
          onClick={() => setIsAutoAnimating(!isAutoAnimating)}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            background: isAutoAnimating ? '#ff4444' : '#4444ff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            width: '100%'
          }}
        >
          {isAutoAnimating ? 'Arrêter l\'animation' : 'Animer automatiquement'}
        </button>
      </div>
    </div>
  );
}