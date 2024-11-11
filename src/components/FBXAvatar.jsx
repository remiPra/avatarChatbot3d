// src/components/FBXAvatar.jsx
import React, { useRef, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function FBXAvatar({ 
  url, 
  mouthOpenValue = 0,
  position = [0, -8.8, 0],
  rotation = [1.56, 1.016*Math.PI, 3.31],
  scale = 0.055,
  smileIntensity = 0.3 // Nouveau paramètre pour contrôler l'intensité du sourire
}) {
  const modelRef = useRef();
  const fbx = useLoader(FBXLoader, url);
  const meshWithMorphTargetsRef = useRef(null);
  
  const currentAnimation = useRef({
    mouthOpen: 0,
    mouthSmile: smileIntensity
  });

  useEffect(() => {
    if (fbx) {
      // Configuration du modèle
      fbx.position.set(...position);
      fbx.rotation.set(...rotation);
      fbx.scale.set(scale, scale, scale);

      // Amélioration des matériaux
      fbx.traverse((child) => {
        if (child.isMesh) {
          if (child.morphTargetDictionary) {
            meshWithMorphTargetsRef.current = child;
            child.material.morphTargets = true;
          }
          
          // Améliorer le rendu des matériaux
          child.material = new THREE.MeshPhongMaterial({
            color: child.material.color || 0x808080,
            specular: 0x111111,
            shininess: 30,
            morphTargets: true,
            skinning: true
          });
        }
      });
    }
  }, [fbx, position, rotation, scale]);

  useFrame(() => {
    const mesh = meshWithMorphTargetsRef.current;
    if (mesh && mesh.morphTargetInfluences) {
      // Animation fluide de la bouche
      currentAnimation.current.mouthOpen += (mouthOpenValue - currentAnimation.current.mouthOpen) * 0.15;
      
      // Appliquer les animations
      mesh.morphTargetInfluences[0] = currentAnimation.current.mouthOpen;    // mouthOpen
      mesh.morphTargetInfluences[1] = currentAnimation.current.mouthSmile;   // mouthSmile
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={fbx}
      dispose={null}
    />
  );
}
