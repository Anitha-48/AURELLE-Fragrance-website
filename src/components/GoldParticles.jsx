import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { sceneState } from '../hooks/sceneState.js';

/** Soft round sprite drawn on a canvas — no texture file required. */
export function makeGlowTexture(inner = 'rgba(255,236,190,1)', outer = 'rgba(197,161,91,0)') {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.35, 'rgba(197,161,91,0.45)');
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function GoldParticles({ count = 180 }) {
  const group = useRef();
  const points = useRef();
  const material = useRef();

  const { base, positions, phases } = useMemo(() => {
    const base = new Float32Array(count * 3);
    const phases = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      // distribute in a loose shell around the bottle
      const r = 1.5 + Math.random() * 2.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      base[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 1.1;
      base[i * 3 + 1] = r * Math.cos(phi) * 1.0;
      base[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 0.6;
      phases[i * 2] = Math.random() * Math.PI * 2;
      phases[i * 2 + 1] = 0.25 + Math.random() * 0.6;
    }
    return { base, positions: new Float32Array(base), phases };
  }, [count]);

  const sprite = useMemo(() => makeGlowTexture(), []);

  useFrame(({ clock }) => {
    const S = sceneState;
    const t = S.reduced ? 0 : clock.elapsedTime;
    group.current.position.set(S.view.x, S.view.y, 0);
    group.current.visible = S.view.s > 0.05;

    for (let i = 0; i < count; i++) {
      const ph = phases[i * 2];
      const sp = phases[i * 2 + 1];
      positions[i * 3] = base[i * 3] + Math.sin(t * sp + ph) * 0.18;
      positions[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * sp * 0.8 + ph * 1.7) * 0.28 + ((t * sp * 0.12 + ph) % 1) * 0.0;
      positions[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * sp + ph) * 0.18;
    }
    points.current.geometry.attributes.position.needsUpdate = true;
    points.current.rotation.y = t * 0.03;
    material.current.opacity = Math.min(1, S.reveal * S.pa * 0.75);
  });

  return (
    <group ref={group}>
      <points ref={points} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={material}
          map={sprite}
          size={0.12}
          sizeAttenuation
          color="#E8C98A"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
