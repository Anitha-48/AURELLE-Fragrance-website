// Shared, mutable scene state.
// GSAP ScrollTrigger WRITES the numeric keyframe values; the R3F render loop only READS them.
// This guarantees a single animation system owns each property.

const PI2 = Math.PI * 2;

// One keyframe per story beat. All keys are numeric so GSAP can tween between them.
// x,y: bottle position  s: scale  ry: base Y rotation  cz: camera distance
// amber: 0 = obsidian, 1 = warm amber backdrop   glow: light intensity   halo: backlight disc
// pa: particle brightness   ml: mobile vertical lift   ms: mobile scale multiplier
export const KEYFRAMES = {
  hero:   { x: 1.9,  y: 0,     s: 1,    ry: 0.35,           cz: 9,   amber: 0,    glow: 1,    halo: 0.35, pa: 0.9, ml: 1.6, ms: 1 },
  story0: { x: 1.9,  y: 0,     s: 1.05, ry: 0.8,            cz: 8,   amber: 0.2,  glow: 1.05, halo: 0.4,  pa: 0.9, ml: 1.6, ms: 1 },
  story1: { x: 1.7,  y: 0,     s: 1.12, ry: PI2 + 0.8,      cz: 5.9, amber: 1,    glow: 1.25, halo: 0.55, pa: 1,   ml: 1.6, ms: 1 },
  notes:  { x: -3.1, y: 0,     s: 0.8,  ry: PI2 + 1.5,      cz: 9,   amber: 0.75, glow: 0.9,  halo: 0.3,  pa: 0.8, ml: 0,   ms: 0 },
  craft0: { x: 0,    y: -0.05, s: 1.12, ry: PI2 + 1.5,      cz: 7.6, amber: 0.35, glow: 1,    halo: 0.25, pa: 0.7, ml: 0,   ms: 1 },
  craft1: { x: 0,    y: -0.05, s: 1.12, ry: PI2 * 2 + 1.5,  cz: 7.6, amber: 0.2,  glow: 1,    halo: 0.25, pa: 0.7, ml: 0,   ms: 1 },
  show:   { x: 0,    y: 0,     s: 1.18, ry: PI2 * 2 + 2.0,  cz: 8,   amber: 0.5,  glow: 1.6,  halo: 0.95, pa: 1.4, ml: 1.6, ms: 1 },
  finale: { x: 0,    y: 1.2,   s: 0.01, ry: PI2 * 2 + 2.6,  cz: 8,   amber: 0.1,  glow: 0.4,  halo: 0,    pa: 0,   ml: 1.6, ms: 1 },
};

export const sceneState = {
  ...KEYFRAMES.hero,
  reveal: 0, // intro reveal 0 → 1 (own property, never touched by scroll tweens)
  pointer: { x: 0, y: 0, active: false },
  craftLive: false,
  reduced:
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  // smoothed bottle placement, written by PerfumeBottle and read by particles/halo
  view: { x: 0, y: 0, s: 1 },
};

// Hotspot DOM elements register here so the render loop can move them with the bottle.
export const hotspotEls = {};

// Anchor points in the bottle's local space (on the vertical axis so they stay put while it spins).
// If you swap in your own GLB, tweak these Y values to match its cap / glass / liquid.
export const ANCHORS = {
  cap: [0, 1.36, 0],
  glass: [0, 0.62, 0],
  fragrance: [0, -0.45, 0],
};

export const MODEL_URL = `${import.meta.env.BASE_URL}models/perfume.glb`;
