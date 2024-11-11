import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import RPMAvatar from './components/RPMAvatar';
import VoiceChat from './components/VoiceChat';

export default function App() {
  const [mouthOpenValue, setMouthOpenValue] = useState(0);
  const [isAutoAnimating, setIsAutoAnimating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationFrameRef = React.useRef(null);
  const audioRef = React.useRef(null);
  const startTimeRef = React.useRef(0);

  useEffect(() => {
    audioRef.current = new Audio('./helena.wav');
    audioRef.current.volume = 0.5;
    audioRef.current.loop = false;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    const animate = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const value = Math.abs(Math.sin(elapsed * 0.008)) * 0.5;
      setMouthOpenValue(value);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (isAutoAnimating) {
      startTimeRef.current = performance.now();
      audioRef.current.play().catch(console.error);
      animationFrameRef.current = requestAnimationFrame(animate);
      setIsAnimating(true);

      audioRef.current.onended = () => {
        setIsAutoAnimating(false);
        setIsAnimating(false);
      };
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      cancelAnimationFrame(animationFrameRef.current);
      setIsAnimating(false);
    }

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isAutoAnimating]);

  useEffect(() => {
    setIsAnimating(isSpeaking || isAutoAnimating);
  }, [isSpeaking, isAutoAnimating]);

  const handleAnimationClick = () => {
    setIsAutoAnimating(!isAutoAnimating);
  };

  return (
    <div className="h-screen w-screen relative">
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <Suspense fallback={null}>
          <Environment preset="studio" />
          <RPMAvatar 
            mouthOpenValue={mouthOpenValue} 
            isAnimating={isAnimating}
          />
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

      <VoiceChat 
        onSpeakingStateChange={setIsSpeaking}
      />

      {/* <div className="absolute top-5 left-5 bg-white bg-opacity-95 p-5 rounded-xl shadow-md">
        <label className="flex items-center gap-2.5">
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
            className="w-48"
          />
          <span>{mouthOpenValue.toFixed(2)}</span>
        </label>

        <button
          onClick={handleAnimationClick}
          className={`mt-2.5 px-5 py-2.5 text-white rounded-md font-bold w-full ${
            isAutoAnimating ? 'bg-red-500' : 'bg-blue-700'
          }`}
        >
          {isAutoAnimating ? 'Arrêter l\'animation' : 'Animer automatiquement'}
        </button>

        <div className="mt-2.5">
          <label className="flex items-center gap-2.5">
            Volume:
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              defaultValue="0.5"
              onChange={(e) => {
                if (audioRef.current) {
                  audioRef.current.volume = parseFloat(e.target.value);
                }
              }}
              className="w-48"
            />
          </label>
        </div>
      </div> */}
    </div>
  );
}