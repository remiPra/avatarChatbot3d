import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import RPMAvatar from './components/RPMAvatar';
import VoiceChat from './components/VoiceChat';
import VoiceChat2 from './components/VoiceChat2';

// Composant pour la page d'accueil avec l'avatar
const Home = () => {
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
    </div>
  );
};

// Page À propos
const About = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">À propos</h1>
      <p>Description de votre projet d'avatar 3D...</p>
    </div>
  );
};

const Home2 = () => {
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

      <VoiceChat2 
        onSpeakingStateChange={setIsSpeaking}
      />
    </div>
  );
};


// Composant de navigation
const Navigation = () => {
  return (
    <nav className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 p-4 z-10">
      <ul className="flex space-x-4">
        <li>
          <Link to="/" className="text-white hover:text-gray-300">Accueil</Link>
        </li>
        <li>
          <Link to="/about" className="text-white hover:text-gray-300">À propos</Link>
        </li>
        <li>
          <Link to="/link" className="text-white hover:text-gray-300">Simple 
          </Link>
        </li>
        
      </ul>
    </nav>
  );
};

// Composant App principal
export default function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/link" element={<Home2 />} />
      </Routes>
    </BrowserRouter>
  );
}