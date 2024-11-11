// src/components/AudioHandler.jsx
import React, { useEffect, useState } from 'react';

export default function AudioHandler({ onAudioData }) {
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);

  const initAudioContext = () => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const audioAnalyser = context.createAnalyser();
    audioAnalyser.fftSize = 32;
    
    setAudioContext(context);
    setAnalyser(audioAnalyser);
  };

  const handleClick = () => {
    if (!audioContext) {
      initAudioContext();
    } else if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  };

  const handleAudioUpload = async (event) => {
    if (!audioContext || !analyser) {
      initAudioContext();
    }
    
    const file = event.target.files[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateMouth = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = Array.from(dataArray).reduce((a, b) => a + b, 0) / dataArray.length;
        const mouthOpenValue = Math.min(average / 128, 1);
        onAudioData(mouthOpenValue);
        
        if (!source.stopped) {
          requestAnimationFrame(updateMouth);
        }
      };

      source.onended = () => {
        source.stopped = true;
        onAudioData(0);
      };

      source.start(0);
      updateMouth();
    } catch (error) {
      console.error('Erreur lors du chargement audio:', error);
    }
  };

  return (
    <div style={{ 
      position: 'absolute', 
      top: 20, 
      left: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <button 
        onClick={handleClick}
        style={{
          padding: '10px',
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Initialiser Audio
      </button>
      <input 
        type="file" 
        accept="audio/*" 
        onChange={handleAudioUpload}
        onClick={handleClick}
        style={{
          padding: '10px',
          background: 'white',
          borderRadius: '5px',
          border: '1px solid #ccc'
        }}
      />
    </div>
  );
}
