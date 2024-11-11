// src/components/RPMAvatar.jsx
import React, { useRef, useEffect, useState } from 'react';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

export default function RPMAvatar({ 
  url = 'https://models.readyplayer.me/6731e8f003bbc9f5ef95cc98.glb?morphTargets=ARKit', 
  mouthOpenValue = 0
}) {
  const modelRef = useRef();
  const headMeshRef = useRef();
  const eyeLeftRef = useRef();
  const eyeRightRef = useRef();
  const gltf = useLoader(GLTFLoader, url);
  const { camera } = useThree();
  const [mousePosition, setMousePosition] = useState(new THREE.Vector3());

  // Gestion du mouvement de la souris
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
        // Récupérer les os des yeux
        if (child.name === 'EyeLeft') eyeLeftRef.current = child;
        if (child.name === 'EyeRight') eyeRightRef.current = child;
      });
    }
  }, [gltf]);

  // Animation des yeux qui clignent
  const blinkTimer = useRef(0);
  const isBlinking = useRef(false);
  const nextBlinkTime = useRef(Math.random() * 5000);

  useFrame((state, delta) => {
    const headMesh = headMeshRef.current;
    if (headMesh && headMesh.morphTargetInfluences && headMesh.morphTargetDictionary) {
      // Animation naturelle de la bouche
      const jawOpenIndex = headMesh.morphTargetDictionary['jawOpen'];
      const mouthOpenIndex = headMesh.morphTargetDictionary['mouthOpen'];
      const mouthSmileIndex = headMesh.morphTargetDictionary['mouthSmile'];
      const mouthPuckerIndex = headMesh.morphTargetDictionary['mouthPucker'];

      if (jawOpenIndex !== undefined) {
        // Animation plus naturelle de la bouche avec plusieurs morphTargets
        headMesh.morphTargetInfluences[jawOpenIndex] = mouthOpenValue * 0.7;
      }
      if (mouthOpenIndex !== undefined) {
        headMesh.morphTargetInfluences[mouthOpenIndex] = mouthOpenValue;
      }
      if (mouthSmileIndex !== undefined) {
        // Léger sourire qui varie avec l'ouverture de la bouche
        headMesh.morphTargetInfluences[mouthSmileIndex] = 0.2 - (mouthOpenValue * 0.1);
      }
      if (mouthPuckerIndex !== undefined) {
        // Légère tension des lèvres
        headMesh.morphTargetInfluences[mouthPuckerIndex] = mouthOpenValue * 0.2;
      }

      // Gestion du clignement des yeux
      blinkTimer.current += delta * 1000;
      if (blinkTimer.current >= nextBlinkTime.current && !isBlinking.current) {
        isBlinking.current = true;
        blinkTimer.current = 0;
        nextBlinkTime.current = Math.random() * 5000 + 2000; // 2-7 secondes entre les clignements
      }

      const eyeBlinkLeftIndex = headMesh.morphTargetDictionary['eyeBlinkLeft'];
      const eyeBlinkRightIndex = headMesh.morphTargetDictionary['eyeBlinkRight'];

      if (eyeBlinkLeftIndex !== undefined && eyeBlinkRightIndex !== undefined) {
        if (isBlinking.current) {
          const blinkValue = Math.sin(blinkTimer.current * 0.02) * 0.5 + 0.5;
          headMesh.morphTargetInfluences[eyeBlinkLeftIndex] = blinkValue;
          headMesh.morphTargetInfluences[eyeBlinkRightIndex] = blinkValue;
          
          if (blinkTimer.current > 150) { // Durée du clignement
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
      const maxRotation = 0.3; // Limite de rotation des yeux

      // Calculer la direction du regard
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

      // Appliquer les rotations avec limites
      eyeLeft.rotation.x = THREE.MathUtils.clamp(leftRotation.x, -maxRotation, maxRotation);
      eyeLeft.rotation.y = THREE.MathUtils.clamp(leftRotation.y, -maxRotation, maxRotation);
      eyeRight.rotation.x = THREE.MathUtils.clamp(rightRotation.x, -maxRotation, maxRotation);
      eyeRight.rotation.y = THREE.MathUtils.clamp(rightRotation.y, -maxRotation, maxRotation);
    }
  });

  return <primitive ref={modelRef} object={gltf.scene} />;
}