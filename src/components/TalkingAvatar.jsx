// src/components/TalkingAvatar.jsx
import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function Avatar() {
  const meshRef = useRef();

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} /> {/* On commence avec un cube comme placeholder */}
      <meshStandardMaterial color="lightblue" />
    </mesh>
  );
}

export default function TalkingAvatar() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Avatar />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
