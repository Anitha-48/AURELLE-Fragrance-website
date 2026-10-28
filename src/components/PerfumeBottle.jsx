import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ANCHORS, MODEL_URL, hotspotEls, sceneState } from '../hooks/sceneState.js';
import { makeGlowTexture } from './GoldParticles.jsx';

const GOLD = '#C5A15B';
const damp = THREE.MathUtils.damp;
const _v = new THREE.Vector3();

/* ---------- label texture drawn on a canvas (no external assets) ---------- */
function useLabelTexture() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 320;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);

  useEffect(() => {
    const draw = () => {
      const g = tex.image.getContext('2d');
      g.clearRect(0, 0, 512, 320);
      g.fillStyle = '#0A0908';
      g.textAlign = 'center';
      g.font = '500 76px "Cormorant Garamond", Georgia, serif';
      g.fillText('AURELLE', 256, 150);
      g.strokeStyle = '#0A0908';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(176, 184);
      g.lineTo(336, 184);
      g.stroke();
      g.font = '400 24px Inter, Arial, sans-serif';
      g.fillText('EAU DE PARFUM', 256, 226);
      g.font = 'italic 400 26px "Cormorant Garamond", Georgia, serif';
      g.fillText('No. 1  ·  50 ml', 256, 264);
      tex.needsUpdate = true;
    };
    draw();
    document.fonts?.ready.then(draw);
  }, [tex]);

  return tex;
}

/* ---------- procedural bottle (works with zero downloaded assets) ---------- */
function ProceduralBottle({ simple }) {
  const label = useLabelTexture();

  const capGeometry = useMemo(() => {
    const pts = [
      [0.0, 0.0], [0.34, 0.0], [0.385, 0.045], [0.385, 0.7], [0.34, 0.76], [0.0, 0.76],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 48);
  }, []);

  const metal = { color: GOLD, metalness: 1, roughness: 0.2, envMapIntensity: 1.6 };

  return (
    <group>
      {/* glass body */}
      <RoundedBox args={[1.7, 2.0, 0.84]} radius={0.16} smoothness={6} position={[0, -0.2, 0]}>
        {simple ? (
          <meshPhysicalMaterial
            color="#fff7e8" transparent opacity={0.3} roughness={0.03} metalness={0}
            clearcoat={1} clearcoatRoughness={0.03} envMapIntensity={2.2} depthWrite={false}
          />
        ) : (
          <meshPhysicalMaterial
            color="#ffffff" transmission={1} thickness={1.1} ior={1.5} roughness={0.03}
            clearcoat={1} clearcoatRoughness={0.03} envMapIntensity={1.8}
            attenuationColor="#f1dcae" attenuationDistance={5}
          />
        )}
      </RoundedBox>

      {/* golden fragrance */}
      <RoundedBox args={[1.5, 1.36, 0.62]} radius={0.1} smoothness={5} position={[0, -0.28, 0]}>
        <meshPhysicalMaterial
          color="#D9A94A" emissive="#7a4a10" emissiveIntensity={0.35}
          roughness={0.12} metalness={0.1} clearcoat={1} envMapIntensity={1.2}
        />
      </RoundedBox>

      {/* label plate */}
      <mesh position={[0, -0.42, 0.321]}>
        <planeGeometry args={[1.0, 0.625]} />
        <meshStandardMaterial map={label} transparent roughness={0.4} metalness={0.2} color="#F4EBDD" />
      </mesh>
      <mesh position={[0, -0.42, 0.318]}>
        <planeGeometry args={[1.04, 0.665]} />
        <meshStandardMaterial {...metal} />
      </mesh>

      {/* neck collar + cap */}
      <mesh position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.2, 0.24, 0.2, 40]} />
        <meshPhysicalMaterial {...metal} />
      </mesh>
      <mesh position={[0, 0.97, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.26, 0.022, 16, 48]} />
        <meshPhysicalMaterial {...metal} />
      </mesh>
      <mesh geometry={capGeometry} position={[0, 0.98, 0]}>
        <meshPhysicalMaterial {...metal} clearcoat={0.6} clearcoatRoughness={0.1} />
      </mesh>
    </group>
  );
}

/* ---------- optional GLB model (public/models/perfume.glb) ---------- */
function ModelBottle() {
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const k = 2.94 / size.y; // normalise to the procedural bottle's height
    clone.position.sub(center);
    const wrap = new THREE.Group();
    wrap.add(clone);
    wrap.scale.setScalar(k);
    wrap.position.y = 0.27;
    clone.traverse((o) => {
      if (o.isMesh && o.material) o.material.envMapIntensity = 1.5;
    });
    return wrap;
  }, [scene]);
  return <primitive object={model} />;
}

/** HEAD-check so a missing model never breaks the page (Vite serves index.html for unknown paths). */
function useModelAvailable(url) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch(url, { method: 'HEAD' })
      .then((r) => alive && setOk(r.ok && !(r.headers.get('content-type') || '').includes('text/html')))
      .catch(() => alive && setOk(false));
    return () => {
      alive = false;
    };
  }, [url]);
  return ok;
}

/* ---------- main bottle: reads sceneState every frame ---------- */
export default function PerfumeBottle({ simple = false, boundary: Boundary }) {
  const tilt = useRef();
  const inner = useRef();
  const halo = useRef();
  const haloMat = useRef();
  const pt = useRef({ x: 0, y: 0 });
  const hover = useRef(1);
  const hasModel = useModelAvailable(MODEL_URL);
  const haloTex = useMemo(() => makeGlowTexture('rgba(255,225,160,0.9)', 'rgba(197,161,91,0)'), []);
  const { camera } = useThree();

  useFrame((state, delta) => {
    const S = sceneState;
    const t = S.reduced ? 0 : state.clock.elapsedTime;
    const { width, height } = state.size;
    const aspect = width / height;
    const mobile = aspect < 0.9;

    // pointer smoothing
    pt.current.x = damp(pt.current.x, S.reduced ? 0 : S.pointer.x, 4, delta);
    pt.current.y = damp(pt.current.y, S.reduced ? 0 : S.pointer.y, 4, delta);

    // placement
    const tx = mobile ? 0 : S.x * Math.min(1, aspect / 1.5);
    const ty = S.y + (mobile ? S.ml : 0) + Math.sin(t * 1.1) * 0.07;
    const v = S.view;
    v.x = damp(v.x, tx, 8, delta);
    v.y = damp(v.y, ty, 8, delta);

    // hover enlargement: pointer close to the bottle's projected centre
    _v.set(v.x, v.y, 0).project(camera);
    const near =
      S.pointer.active && Math.hypot((_v.x - S.pointer.x) * aspect, _v.y - S.pointer.y) < 0.38;
    hover.current = damp(hover.current, near ? 1.06 : 1, 5, delta);

    const reveal = S.reveal;
    const target = S.s * (mobile ? Math.max(S.ms, 0) * 0.95 : 1) * (mobile ? 1 : 1) * (0.88 + 0.12 * reveal);
    v.s = damp(v.s, target, 8, delta);
    const g = tilt.current;
    g.visible = v.s > 0.03;
    g.position.set(v.x, v.y, 0);
    g.scale.setScalar(Math.max(v.s, 0.0001) * hover.current);
    g.rotation.y = S.ry + (1 - reveal) * 1.8 + Math.sin(t * 0.4) * 0.1 + pt.current.x * 0.45;
    g.rotation.x = -pt.current.y * 0.16;
    g.rotation.z = -pt.current.x * 0.035;

    if (halo.current) {
      halo.current.position.set(v.x, v.y, -1.6);
      halo.current.visible = v.s > 0.05;
      haloMat.current.opacity = Math.min(1, S.halo * reveal);
    }

    // hotspot screen positions follow the 3D anchors
    if (S.craftLive) {
      camera.updateMatrixWorld();
      inner.current.updateWorldMatrix(true, false);
      for (const id in ANCHORS) {
        const el = hotspotEls[id];
        if (!el) continue;
        _v.set(...ANCHORS[id]);
        inner.current.localToWorld(_v);
        _v.project(camera);
        el.style.left = `${(_v.x * 0.5 + 0.5) * width}px`;
        el.style.top = `${(-_v.y * 0.5 + 0.5) * height}px`;
      }
    }
  });

  const Fallback = <ProceduralBottle simple={simple} />;

  return (
    <>
      <mesh ref={halo} renderOrder={-1}>
        <planeGeometry args={[11, 11]} />
        <meshBasicMaterial
          ref={haloMat} map={haloTex} transparent opacity={0} depthWrite={false}
          blending={THREE.AdditiveBlending} toneMapped={false}
        />
      </mesh>
      <group ref={tilt}>
        <group ref={inner} position={[0, -0.27, 0]}>
          {hasModel && Boundary ? (
            <Boundary fallback={Fallback}>
              <Suspense fallback={Fallback}>
                <ModelBottle />
              </Suspense>
            </Boundary>
          ) : (
            Fallback
          )}
        </group>
      </group>
    </>
  );
}
