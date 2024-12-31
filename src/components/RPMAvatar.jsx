import React, { useRef, useEffect, useState } from 'react';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

export default function RPMAvatar({ 
  url = 'https://models.readyplayer.me/6731e8f003bbc9f5ef95cc98.glb?morphTargets=ARKit', 
  mouthOpenValue = 0,
  isAnimating = false
}) {
  const modelRef = useRef();
  const headMeshRef = useRef();
  const eyeLeftRef = useRef();
  const eyeRightRef = useRef();
  const animationTimeRef = useRef(0);
  const linesRef = useRef([{}, {}, {}]); // Pour les 3 parties de l'animation
  const [volume, setVolume] = useState(0);
  const gltf = useLoader(GLTFLoader, url);
  const { camera } = useThree();
  const [mousePosition, setMousePosition] = useState(new THREE.Vector3());

  useEffect(() => {
    const handleMouseMove = (event) => {
      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );

      const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
      vector.unproject(camera);
      setMousePosition(vector);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [camera]);

  useEffect(() => {
    if (gltf) {
      gltf.scene.position.set(0, -6.5, 0);
      gltf.scene.rotation.set(0, 0, 0);
      gltf.scene.scale.set(4, 4, 4);

      gltf.scene.traverse((child) => {
        if (child.isMesh && child.name.includes('Wolf3D_Head')) {
          headMeshRef.current = child;
          child.material.morphTargets = true;
        }
        if (child.name === 'EyeLeft') eyeLeftRef.current = child;
        if (child.name === 'EyeRight') eyeRightRef.current = child;
      });
    }
  }, [gltf]);

  // Animation du volume
  useEffect(() => {
    let timeout = null;
    const update = () => {
      if (isAnimating) {
        const newVolume = Math.random() * 0.1; // Simuler le volume
        setVolume(newVolume);
      }
      timeout = window.setTimeout(update, 100);
    };
    update();
    return () => clearTimeout(timeout);
  }, [isAnimating]);

  const blinkTimer = useRef(0);
  const isBlinking = useRef(false);
  const nextBlinkTime = useRef(Math.random() * 5000);

  const lipMovement = (time, volume, index) => {
    const baseAmplitude = index === 1 ? 400 : 60;
    const height = Math.min(24, 4 + volume * baseAmplitude) / 24;
    
    return (
      height * 0.5 + 
      Math.sin(time * 15 + index * 0.5) * 0.2 * height +
      Math.random() * 0.05 // Léger bruit aléatoire
    );
  };

  useFrame((state, delta) => {
    const headMesh = headMeshRef.current;
    if (headMesh && headMesh.morphTargetInfluences && headMesh.morphTargetDictionary) {
      const jawOpenIndex = headMesh.morphTargetDictionary['jawOpen'];
      const mouthOpenIndex = headMesh.morphTargetDictionary['mouthOpen'];
      const mouthSmileIndex = headMesh.morphTargetDictionary['mouthSmile'];
      const mouthPuckerIndex = headMesh.morphTargetDictionary['mouthPucker'];
      const mouthShrugUpperIndex = headMesh.morphTargetDictionary['mouthShrugUpper'];
      const mouthFunnelIndex = headMesh.morphTargetDictionary['mouthFunnel'];
      const mouthRollLowerIndex = headMesh.morphTargetDictionary['mouthRollLower'];

      if (isAnimating) {
        animationTimeRef.current += delta;

        // Calculer les valeurs d'animation pour chaque partie
        const leftValue = lipMovement(animationTimeRef.current, volume, 0);
        const centerValue = lipMovement(animationTimeRef.current, volume, 1);
        const rightValue = lipMovement(animationTimeRef.current, volume, 2);

        // Appliquer les animations
        if (jawOpenIndex !== undefined) {
          headMesh.morphTargetInfluences[jawOpenIndex] = centerValue * 0.5;
        }
        if (mouthOpenIndex !== undefined) {
          headMesh.morphTargetInfluences[mouthOpenIndex] = centerValue * 0.7;
        }
        if (mouthSmileIndex !== undefined) {
          headMesh.morphTargetInfluences[mouthSmileIndex] = leftValue * 0.3;
        }
        if (mouthPuckerIndex !== undefined) {
          headMesh.morphTargetInfluences[mouthPuckerIndex] = rightValue * 0.2;
        }
        if (mouthShrugUpperIndex !== undefined) {
          headMesh.morphTargetInfluences[mouthShrugUpperIndex] = centerValue * 0.2;
        }
        if (mouthFunnelIndex !== undefined) {
          headMesh.morphTargetInfluences[mouthFunnelIndex] = centerValue * 0.15;
        }
        if (mouthRollLowerIndex !== undefined) {
          headMesh.morphTargetInfluences[mouthRollLowerIndex] = centerValue * 0.1;
        }
      } else {
        // État statique
        const staticValues = {
          [jawOpenIndex]: mouthOpenValue * 0.7,
          [mouthOpenIndex]: mouthOpenValue,
          [mouthSmileIndex]: 0.2 - (mouthOpenValue * 0.1),
          [mouthPuckerIndex]: mouthOpenValue * 0.2
        };

        Object.entries(staticValues).forEach(([index, value]) => {
          if (index !== undefined) {
            headMesh.morphTargetInfluences[index] = value;
          }
        });

        animationTimeRef.current = 0;
      }

      // Gestion du clignement des yeux
      blinkTimer.current += delta * 1000;
      if (blinkTimer.current >= nextBlinkTime.current && !isBlinking.current) {
        isBlinking.current = true;
        blinkTimer.current = 0;
        nextBlinkTime.current = Math.random() * 5000 + 2000;
      }

      const eyeBlinkLeftIndex = headMesh.morphTargetDictionary['eyeBlinkLeft'];
      const eyeBlinkRightIndex = headMesh.morphTargetDictionary['eyeBlinkRight'];

      if (eyeBlinkLeftIndex !== undefined && eyeBlinkRightIndex !== undefined) {
        if (isBlinking.current) {
          const blinkValue = Math.sin(blinkTimer.current * 0.02) * 0.5 + 0.5;
          headMesh.morphTargetInfluences[eyeBlinkLeftIndex] = blinkValue;
          headMesh.morphTargetInfluences[eyeBlinkRightIndex] = blinkValue;
          
          if (blinkTimer.current > 150) {
            isBlinking.current = false;
            blinkTimer.current = 0;
          }
        }
      }
    }

    // Animation des yeux qui suivent la souris
    const eyeLeft = eyeLeftRef.current;
    const eyeRight = eyeRightRef.current;
    
    if (eyeLeft && eyeRight && mousePosition) {
      const target = mousePosition.clone();
      const maxRotation = 0.3;

      eyeLeft.getWorldPosition(new THREE.Vector3());
      eyeRight.getWorldPosition(new THREE.Vector3());

      const leftRotation = new THREE.Euler().setFromQuaternion(
        new THREE.Quaternion().setFromRotationMatrix(
          new THREE.Matrix4().lookAt(eyeLeft.position, target, new THREE.Vector3(0, 1, 0))
        )
      );
      const rightRotation = new THREE.Euler().setFromQuaternion(
        new THREE.Quaternion().setFromRotationMatrix(
          new THREE.Matrix4().lookAt(eyeRight.position, target, new THREE.Vector3(0, 1, 0))
        )
      );

      eyeLeft.rotation.x = THREE.MathUtils.clamp(leftRotation.x, -maxRotation, maxRotation);
      eyeLeft.rotation.y = THREE.MathUtils.clamp(leftRotation.y, -maxRotation, maxRotation);
      eyeRight.rotation.x = THREE.MathUtils.clamp(rightRotation.x, -maxRotation, maxRotation);
      eyeRight.rotation.y = THREE.MathUtils.clamp(rightRotation.y, -maxRotation, maxRotation);
    }
  });

  return <primitive ref={modelRef} object={gltf.scene} />;
}