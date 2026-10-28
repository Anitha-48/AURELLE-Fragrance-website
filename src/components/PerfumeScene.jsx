import { Component, Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import GoldParticles from './GoldParticles.jsx';
import { sceneState } from '../hooks/sceneState.js';

const damp = THREE.MathUtils.damp;
const BG_DARK = new THREE.Color('#0A0908');
const BG_AMBER = new THREE.Color('#36251F');
const LIGHT_GOLD = new THREE.Color('#fff1d6');
const LIGHT_AMBER = new THREE.Color('#ffb869');
const _c = new THREE.Color();
const _p = new THREE.Vector3();

/** Error boundary for the retained particle and lighting scene. */
export class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err) {
    console.warn('[AURELLE] Particle scene failed:', err);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

/** Camera distance, scene lighting and the CSS backdrop all follow sceneState. */
function SceneRig() {
  const { camera, scene } = useThree();
  const key = useRef();
  const rim = useRef();
  const front = useRef();
  const lastBg = useRef('');

  useFrame((state, delta) => {
    const S = sceneState;
    const { width, height } = state.size;
    const aspect = width / height;
    const fit = Math.min(2.1, Math.max(1, 1.02 / aspect)); // preserve composition on tall screens

    camera.position.z = damp(camera.position.z, S.cz * fit, 6, delta);
    camera.updateMatrixWorld();

    const power = S.glow * (0.15 + 0.85 * S.reveal);
    _c.copy(LIGHT_GOLD).lerp(LIGHT_AMBER, S.amber * 0.8);
    key.current.color.copy(_c);
    key.current.intensity = 150 * power;
    rim.current.intensity = 60 * power;
    front.current.intensity = 10 * power;
    scene.environmentIntensity = 0.55 + 0.55 * power;

    // Backdrop colour and radial glow follow the scene keyframes.
    _c.copy(BG_DARK).lerp(BG_AMBER, S.amber);
    _p.set(S.view.x, S.view.y, 0).project(camera);
    const css = `${_c.getStyle()}|${S.halo.toFixed(2)}|${_p.x.toFixed(2)}|${_p.y.toFixed(2)}`;
    if (css !== lastBg.current) {
      lastBg.current = css;
      const root = document.documentElement.style;
      root.setProperty('--scene-bg', _c.getStyle());
      root.setProperty('--scene-glow', (S.halo * S.reveal).toFixed(3));
      root.setProperty('--glow-x', `${((_p.x * 0.5 + 0.5) * 100).toFixed(1)}%`);
      root.setProperty('--glow-y', `${((-_p.y * 0.5 + 0.5) * 100).toFixed(1)}%`);
    }
  });

  return (
    <>
      <ambientLight intensity={0.15} />
      <spotLight ref={key} position={[4, 6, 6]} angle={0.5} penumbra={1} decay={2} intensity={0} />
      <pointLight ref={rim} position={[-5, 2, -3]} color="#ffd8a0" decay={2} intensity={0} />
      <pointLight ref={front} position={[0, 0, 4]} color="#C5A15B" decay={2} intensity={0} />
    </>
  );
}

export default function PerfumeScene() {
  const [supported] = useState(() => webglAvailable());
  const [mobile, setMobile] = useState(() => window.innerWidth < 800);
  const [dprMax, setDprMax] = useState(() => (window.innerWidth < 800 ? 1.5 : 2));

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 800);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  if (!supported) return null;

  return (
    <div className="scene-canvas" aria-hidden="true">
      <SceneBoundary fallback={null}>
        <Canvas
          dpr={[1, dprMax]}
          camera={{ position: [0, 0, 9], fov: 32, near: 0.1, far: 60 }}
          gl={{ antialias: !mobile, alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
            gl.setClearColor(0x000000, 0);
          }}
        >
          <PerformanceMonitor onDecline={() => setDprMax(1)} />
          <SceneRig />
          <Suspense fallback={null}>
            {/* procedural studio lighting: no HDR download needed */}
            <Environment resolution={256} frames={1}>
              <Lightformer form="rect" intensity={4} position={[0, 5, -4]} scale={[10, 3, 1]} color="#fff3dc" />
              <Lightformer form="rect" intensity={2.5} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} color="#ffd9a0" />
              <Lightformer form="rect" intensity={2} position={[5, 0, 3]} rotation-y={-Math.PI / 2} scale={[4, 6, 1]} color="#ffffff" />
              <Lightformer form="ring" intensity={1.5} position={[0, 0, -6]} scale={6} color="#C5A15B" />
            </Environment>
          </Suspense>
          <GoldParticles count={mobile ? 70 : 180} />
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
