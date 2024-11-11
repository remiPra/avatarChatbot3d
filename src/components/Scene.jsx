
// Scene.jsx - Ajout de contrôles pour le sourire
import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import FBXAvatar from './FBXAvatar';

export default function Scene() {
  const [mouthOpenValue, setMouthOpenValue] = useState(0);
  const [smileIntensity, setSmileIntensity] = useState(0.3);
  const [isAutoAnimating, setIsAutoAnimating] = useState(false);

  React.useEffect(() => {
    if (isAutoAnimating) {
      let time = 0;
      const animate = () => {
        time += 0.05;
        const value = Math.abs(Math.sin(time)) * 0.8;
        setMouthOpenValue(value);
        return requestAnimationFrame(animate);
      };
      const animationFrame = animate();
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [isAutoAnimating]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
        <Suspense fallback={null}>
          <Environment preset="studio" />
          <FBXAvatar 
            url="/sans_nom.fbx"
            mouthOpenValue={mouthOpenValue}
            smileIntensity={smileIntensity}
          />
          <OrbitControls enableDamping dampingFactor={0.05} />
        </Suspense>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
      </Canvas>

      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
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

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          Intensité du sourire:
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={smileIntensity}
            onChange={(e) => setSmileIntensity(parseFloat(e.target.value))}
            style={{ width: '200px' }}
          />
          <span>{smileIntensity.toFixed(2)}</span>
        </label>
        
        <button
          onClick={() => setIsAutoAnimating(!isAutoAnimating)}
          style={{
            padding: '8px 16px',
            background: isAutoAnimating ? '#ff4444' : '#4444ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isAutoAnimating ? 'Arrêter l\'animation' : 'Animer automatiquement'}
        </button>
      </div>
    </div>
  );
}