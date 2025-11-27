'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment, Float } from '@react-three/drei';

function NetworkGraph({ count = 250, radius = 20 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const groupRef = useRef<THREE.Group>(null);

  const { positions, colors, lines } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const p = new Array(count).fill(0).map(() => new THREE.Vector3());
    
    // Generate points
    for (let i = 0; i < count; i++) {
      // Random point inside a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random()) * radius; // uniform distribution in sphere

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      p[i].set(x, y, z);
      p[i].toArray(positions, i * 3);

      // Mix subtle colors: white, grey, and a hint of "tech" blue/purple
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.1 + 0.6, 0.05, Math.random() * 0.5 + 0.5); // White-ish
      color.toArray(colors, i * 3);
    }

    // Generate connections
    const linePositions = [];
    const connectionDistance = radius * 0.35; // Connection threshold

    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dist = p[i].distanceTo(p[j]);
        if (dist < connectionDistance) {
          linePositions.push(p[i].x, p[i].y, p[i].z);
          linePositions.push(p[j].x, p[j].y, p[j].z);
        }
      }
    }

    return { 
      positions, 
      colors, 
      lines: new Float32Array(linePositions) 
    };
  }, [count, radius]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Slow rotation
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[lines, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

export function Scene3D() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full bg-bg">
      <Canvas
        camera={{ position: [0, 0, 25], fov: 60 }}
        dpr={[1, 2]} // Handle high DPI screens
        gl={{ antialias: true, alpha: true }}
      >
        <fog attach="fog" args={['#050505', 15, 35]} />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
             <NetworkGraph />
        </Float>
      </Canvas>
    </div>
  );
}